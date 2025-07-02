import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firestore/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 送出重設密碼
  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('請輸入電子信箱');
      return;
    }
    setLoading(true);
    try {
      // 送出重設信件
      await sendPasswordResetEmail(auth, email.trim());
      // 直接導回登入頁並帶參數
      router.replace({ pathname: '/(auth)/login', params: { reset: '1' } });
    } catch (err: any) {
      Alert.alert('發送失敗', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>重設密碼</Text>
        <TextInput
          style={styles.input}
          placeholder="請輸入電子信箱"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '寄送中...' : '寄送密碼重設信'}</Text>
        </TouchableOpacity>
        {/* 回登入頁 */}
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.back}>返回登入頁</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f6657' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, color: '#222', marginBottom: 28, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, width: '100%', marginBottom: 16, borderColor: '#ccc', borderWidth: 1 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 10, alignItems: 'center', width: '100%', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  back: { color: '#407700', fontSize: 16, marginTop: 24, textDecorationLine: 'underline' },
});
