import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../../../firestore/firebase';
 
export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
 
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  };
 
  const handleRegister = async () => {
    setMessage('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage('❌ 請填寫所有欄位');
      return;
    }
    if (!validateEmail(email)) {
      setMessage('❌ 電子信箱格式不正確');
      return;
    }
    if (password.length < 6) {
      setMessage('❌ 密碼至少需要6位數');
      return;
    }
 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
 
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
 
      setRegistered(true);
      setMessage('✅ 註冊成功！請點擊下方按鈕前往登入頁');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setMessage('❌ 此信箱已被註冊');
      } else {
        setMessage('❌ 註冊失敗，請檢查資料是否正確');
      }
    }
  };
 
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerText}>帳號註冊</Text>
      </View>
 
      <View style={styles.container}>
        {!registered && (
          <>
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
            {message !== '' && (
              <Text style={[styles.messageText, message.includes('✅') ? styles.success : styles.error]}>
                {message}
              </Text>
            )}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerText}>註冊</Text>
            </TouchableOpacity>
          </>
        )}
 
        {registered && (
          <>
            <Text style={[styles.messageText, styles.success]}>{message}</Text>
            <TouchableOpacity
              style={[styles.registerButton, { marginTop: 20 }]}
              onPress={() => router.replace('../../login/login')}
            >
              <Text style={styles.registerText}>前往登入</Text>
            </TouchableOpacity>
          </>
        )}
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
    justifyContent: 'center',
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  registerButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});