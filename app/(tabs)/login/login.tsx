import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth } from '../../../firestore/firebase';
 
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const router = useRouter();
 
  const handleLogin = async () => {
    console.log('🟢 handleLogin 被觸發');
 
    if (!email || !password) {
      setErrorText('請輸入帳號與密碼');
      return;
    }
 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      alert(`登入成功！歡迎 ${user.email}`);
      setErrorText('');
    } catch (error: any) {
      console.log('登入錯誤：', error.message);
      setErrorText('使用者不存在或密碼錯誤');
    }
  };
 
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerText}>歡迎使用</Text>
      </View>
 
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/bg-yellow-half.png')}
          style={styles.bgImage}
        />
 
        <View style={styles.formArea}>
          <TextInput
            style={styles.input}
            placeholder="輸入電子信箱或手機號碼"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="輸入密碼"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
 
          <View style={styles.row}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity>
              <Text style={styles.forgot}>忘記密碼？</Text>
            </TouchableOpacity>
          </View>
 
          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
 
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>登入</Text>
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.registerContainer}
            onPress={() => router.push('../../login/register')}
          >
            <View style={styles.greenCircle} />
            <View>
              <Text style={styles.registerText}>沒有帳號？</Text>
              <Text style={styles.registerLink}>點我註冊</Text>
              <View style={styles.underline} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f6657',
  },
  header: {
    height: 60,
    backgroundColor: '#0f6657',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f2e6',
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent: 'center',
  },
  formArea: {
    gap: 16,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  forgot: {
    color: '#333',
    fontSize: 14,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  greenCircle: {
    width: 24,
    height: 24,
    backgroundColor: '#407700',
    borderRadius: 12,
  },
  registerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  underline: {
    height: 4,
    width: 80,
    backgroundColor: '#e6c531',
    marginTop: -4,
  },
});