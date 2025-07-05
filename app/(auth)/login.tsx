import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firestore/firebase';
import { useAuth } from '../AuthProvider';

const bgImg = require('../../assets/images/yellowhalf.png');
const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <--- 新增
  const [errorText, setErrorText] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const router = useRouter();
  const params = useGlobalSearchParams();
  const { user } = useAuth();

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (params.justRegistered) {
      Alert.alert('註冊成功', '已寄送驗證信，請到信箱完成驗證後再登入。');
    }
    if (params.reset) {
      Alert.alert('信件已寄出', '請至信箱點擊連結重設密碼。');
    }
  }, [params.justRegistered, params.reset]);

  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user, router]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 登入流程
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorText('請輸入電子郵件與密碼');
      return;
    }
    setIsLoading(true);
    animateButton();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loginUser = userCredential.user;
      if (!loginUser.emailVerified) {
        await signOut(auth);
        setShowVerify(true);
        return;
      }
      setErrorText('');
    } catch (err: any) {
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
    } finally {
      setIsLoading(false);
    }
  };

  // 重新寄送驗證信
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

  // 驗證畫面
  if (showVerify) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar backgroundColor="#0f6657" barStyle="light-content" />
        <View style={styles.container}>
          <Animated.View style={[styles.verifyContainer, { opacity: fadeAnim }]}>
            <View style={styles.verifyIconContainer}>
              <Text style={styles.verifyIcon}>📧</Text>
            </View>
            <Text style={styles.verifyTitle}>尚未完成電子郵件認證</Text>
            <Text style={styles.verifyHint}>請至信箱點擊驗證連結，再重新登入。</Text>
            <TouchableOpacity
              style={[styles.loginButton, styles.verifyButton]}
              onPress={handleResend}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>重新寄送驗證信</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowVerify(false)}>
              <Text style={styles.forgot}>返回登入畫面</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // 一般登入畫面
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#0f6657" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Animated.Text style={[styles.headerText, { opacity: fadeAnim }]}>
            歡迎使用
          </Animated.Text>
        </View>

        <View style={styles.container}>
          <Image source={bgImg} style={styles.bgImage} />

          <Animated.View
            style={[
              styles.formArea,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>登入您的帳戶</Text>
              <Text style={styles.welcomeSubtitle}>輕鬆管理您的專屬空間</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <Text style={styles.inputLabel}>電子信箱</Text>
                <TextInput
                  style={[styles.input, emailFocused && styles.inputFocused]}
                  placeholder="輸入電子信箱"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Text style={styles.inputLabel}>密碼</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, passwordFocused && styles.inputFocused, { flex: 1 }]}
                    placeholder="輸入密碼"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    style={{ padding: 8, marginLeft: -32 }}
                    accessibilityLabel={showPassword ? '隱藏密碼' : '顯示密碼'}
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#888" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {errorText ? (
              <Animated.View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.error}>{errorText}</Text>
              </Animated.View>
            ) : null}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonLoading]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginText}>登入</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={styles.forgot}>忘記密碼？</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerContainer}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.registerText}>沒有帳號？</Text>
                <Text style={[styles.registerText, styles.registerLink]}>點我註冊</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f6657',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 80,
    backgroundColor: '#0f6657',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f2e6',
    paddingHorizontal: 24,
    position: 'relative',
    paddingTop: 40,
  },
  formArea: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.5,   // 讓圖在不同寬度下自動變大（可調整 0.5~0.7）
    height: width * 0.5,
    resizeMode: 'contain',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f6657',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    gap: 20,
  },
  inputWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWrapperFocused: {
    borderColor: '#0f6657',
    shadowOpacity: 0.2,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    paddingTop: 8,
    fontSize: 16,
    color: '#333',
  },
  inputFocused: {
    backgroundColor: '#f8f8f8',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#0f6657',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0f6657',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonLoading: {
    backgroundColor: '#0f665799',
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 16,
  },
  forgot: {
    color: '#0f6657',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontWeight: '600',
    color: '#407700',
    textDecorationLine: 'underline',
  },

  // 驗證畫面樣式
  verifyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  verifyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyIcon: {
    fontSize: 32,
  },
  verifyTitle: {
    color: '#0f6657',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyHint: {
    color: '#666',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 16,
  },
});
