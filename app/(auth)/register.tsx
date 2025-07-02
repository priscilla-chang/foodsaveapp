import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
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
import { auth, db } from '../../firestore/firebase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 註冊主流程
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('錯誤', '請填寫所有欄位');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('錯誤', '電子信箱格式不正確');
      return;
    }
    if (password.length < 6) {
      Alert.alert('錯誤', '密碼至少6位數');
      return;
    }

    setLoading(true);
    try {
      // 1. 註冊
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      // 2. 更新顯示名稱
      await updateProfile(user, { displayName: name.trim() });
      // 3. 寫入 Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        createdAt: serverTimestamp(),
      });
      // 4. 發送驗證信
      await sendEmailVerification(user);
      // 5. 登出並回登入頁（帶參數 justRegistered 顯示註冊完成提示）
      signOut(auth).then(() => {
        router.replace({ pathname: '/(auth)/login', params: { justRegistered: '1' } });
      });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        Alert.alert('錯誤', '此信箱已被註冊');
      } else {
        Alert.alert('錯誤', '註冊失敗，請檢查資料是否正確');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerText}>帳號註冊</Text>
      </View>
      <View style={styles.container}>
        <Image source={require('../../assets/images/yellowhalf.png')} style={styles.bgImage} />
        <TextInput
          style={styles.input}
          placeholder="輸入姓名"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="輸入電子信箱"
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
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerText}>註冊</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>
            已有帳號？<Text style={{ textDecorationLine: 'underline' }}>點我登入</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f6657' },
  header: { height: 60, backgroundColor: '#0f6657', justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  container: { flex: 1, backgroundColor: '#f9f2e6', paddingHorizontal: 24, justifyContent: 'center', gap: 16 },
  bgImage: { position: 'absolute', top: 0, right: 0, width: 140, height: 140, resizeMode: 'contain' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderColor: '#ccc', borderWidth: 1, marginBottom: 8 },
  registerButton: { backgroundColor: '#000', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  registerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#407700', fontSize: 16, marginTop: 16, textAlign: 'center' },
});
