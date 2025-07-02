import { useGlobalSearchParams, useRouter } from 'expo-router';
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firestore/firebase';
import { useAuth } from '../AuthProvider';

const bgImg = require('../../assets/images/yellowhalf.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { user } = useAuth();

  // 檢查 query string，註冊/重設密碼完成後提示
  useEffect(() => {
    if (params.justRegistered) {
      Alert.alert('註冊成功', '已寄送驗證信，請到信箱完成驗證後再登入。');
    }
    if (params.reset) {
      Alert.alert('信件已寄出', '請至信箱點擊連結重設密碼。');
    }
  }, [params.justRegistered, params.reset]);

  // 若已登入自動導到主頁
  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user, router]);

  // 登入邏輯
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorText('請輸入帳號與密碼');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loginUser = userCredential.user;
      if (!loginUser.emailVerified) {
        await signOut(auth);
        setShowVerify(true); // 顯示未驗證頁
        return;
      }
      setErrorText('');
      // 登入成功會因 useEffect 自動跳轉
    } catch (err: any) {
      // 常見錯誤分類
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        Alert.alert(
          '帳號不存在或密碼錯誤',
          '查無此帳號或密碼錯誤，是否要註冊新帳號？',
          [
            { text: '取消', style: 'cancel' },
            { text: '前往註冊', onPress: () => router.push('/(auth)/register') },
          ]
        );
      } else if (err.code === 'auth/wrong-password') {
        setErrorText('');
        Alert.alert('密碼錯誤', '密碼輸入錯誤，請再檢查一次');
      } else if (err.code === 'auth/invalid-email') {
        setErrorText('信箱格式錯誤，請重新輸入');
        Alert.alert('信箱格式錯誤', '請輸入正確的電子郵件格式');
      } else {
        setErrorText('');
        Alert.alert('⚠️ 登入失敗', err.message ?? '未知錯誤，請稍後再試');
      }
    }
  };

  // 未驗證時的重新寄送
  const handleResend = async () => {
    setVerifying(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      Alert.alert('已重新寄出驗證信，請到信箱查收！');
    } catch (err: any) {
      Alert.alert('寄送失敗', err.message);
    }
    setVerifying(false);
  };

  // 未驗證畫面
  if (showVerify) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.verifyTitle}>尚未完成電子郵件認證</Text>
          <Text style={styles.verifyHint}>請至信箱點擊驗證連結，再重新登入。</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleResend} disabled={verifying}>
            {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>重新寄送驗證信</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowVerify(false)}>
            <Text style={styles.forgot}>返回登入畫面</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 一般登入畫面
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerText}>歡迎使用</Text>
      </View>
      <View style={styles.container}>
        <Image source={bgImg} style={styles.bgImage} />
        <View style={styles.formArea}>
          <TextInput
            style={styles.input}
            placeholder="輸入電子信箱或手機號碼"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="輸入密碼"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>登入</Text>
          </TouchableOpacity>
          {/* 忘記密碼功能 */}
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgot}>忘記密碼？</Text>
          </TouchableOpacity>
          {/* 註冊新帳號 */}
          <TouchableOpacity style={styles.registerContainer} onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerText, { textDecorationLine: 'underline' }]}>沒有帳號？點我註冊</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f6657' },
  header: { height: 60, backgroundColor: '#0f6657', justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  container: { flex: 1, backgroundColor: '#f9f2e6', paddingHorizontal: 24, position: 'relative', justifyContent: 'center' },
  formArea: { gap: 16 },
  bgImage: { position: 'absolute', top: 0, right: 0, width: 140, height: 140, resizeMode: 'contain' },
  input: { backgroundColor: '#ffffff', borderRadius: 8, padding: 12, borderColor: '#ccc', borderWidth: 1 },
  error: { color: 'red', textAlign: 'center' },
  loginButton: { backgroundColor: '#000', padding: 16, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  loginText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  forgot: { color: '#333', textAlign: 'right', marginTop: 8, fontSize: 14 },
  registerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  registerText: { fontSize: 16, fontWeight: '600', color: '#407700' },
  verifyTitle: { color: 'red', fontWeight: 'bold', fontSize: 20, marginBottom: 16, textAlign: 'center' },
  verifyHint: { color: '#222', fontSize: 16, marginBottom: 24, textAlign: 'center' },
});
