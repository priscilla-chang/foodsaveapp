import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  Firestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  InteractionManager,
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
import { auth, db } from '../../firestore/firebase';

const bgImg = require('../../assets/images/yellowhalf.png');
const { width } = Dimensions.get('window');

// === 型別 ===
type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

// === 常數 ===
const ANIMATION_DURATION = 800;
const BUTTON_ANIMATION_DURATION = 100;
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_STRENGTH = 3;
const initialForm: RegisterForm = { name: '', email: '', password: '' };

// === 工具 ===
const getPasswordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) score++;
  return score;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const getPasswordStrengthInfo = (strength: number) => {
  if (strength <= 2) return { text: '弱', color: '#ef4444' };
  if (strength <= 3) return { text: '中', color: '#f59e0b' };
  return { text: '強', color: '#10b981' };
};

const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return '此信箱已註冊';
    case 'auth/weak-password':
      return '密碼太弱';
    case 'auth/invalid-email':
      return '信箱格式不正確';
    case 'auth/network-request-failed':
      return '網路連線失敗，請檢查網路狀態';
    case 'auth/too-many-requests':
      return '嘗試次數過多，請稍後再試';
    default:
      return '註冊失敗，請檢查資料或稍後再試';
  }
};

function getFormErrors(form: RegisterForm, validateField: any) {
  return {
    name: validateField('name', form.name),
    email: validateField('email', form.email),
    password: validateField('password', form.password),
  };
}

// === firebase 註冊流程（型別明確） ===
async function createUserData(
  form: RegisterForm,
  auth: Auth,
  db: Firestore
) {
  const userCredential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
  const user = userCredential.user;
  await Promise.all([
    updateProfile(user, { displayName: form.name.trim() }),
    setDoc(doc(db, 'users', user.uid), {
      name: form.name.trim(),
      email: user.email,
      createdAt: serverTimestamp(),
    }),
  ]);
  await sendEmailVerification(user);
  await signOut(auth);
}

// === 主元件 ===
export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterForm>({ ...initialForm });
  const [errors, setErrors] = useState<RegisterForm>({ ...initialForm });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ [k in keyof RegisterForm]: boolean }>({
    name: false,
    email: false,
    password: false,
  });
  const [focusedField, setFocusedField] = useState<null | keyof RegisterForm>(null);

  const router = useRouter();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Input refs
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // 初始化動畫
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  // 密碼強度
  const passwordStrengthInfo = useMemo(() => {
    const strength = getPasswordStrength(form.password);
    return {
      strength,
      ...getPasswordStrengthInfo(strength),
    };
  }, [form.password]);

  // 驗證
  const validateField = useCallback((key: keyof RegisterForm, value: string): string => {
    switch (key) {
      case 'name':
        if (!value.trim()) return '請輸入姓名';
        if (value.trim().length < MIN_NAME_LENGTH) return '姓名至少2個字';
        return '';
      case 'email':
        if (!value.trim()) return '請輸入電子信箱';
        if (!validateEmail(value)) return '信箱格式不正確';
        return '';
      case 'password':
        if (!value) return '請輸入密碼';
        if (value.length < MIN_PASSWORD_LENGTH) return '密碼至少8位數';
        if (getPasswordStrength(value) < MIN_PASSWORD_STRENGTH) {
          return '密碼強度不足，請加入數字、大小寫、特殊符號';
        }
        return '';
      default:
        return '';
    }
  }, []);

  // 表單互動
  const handleChange = useCallback((key: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((key: keyof RegisterForm) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    setFocusedField(null);
    setErrors(prev => ({ ...prev, [key]: validateField(key, form[key]) }));
  }, [form, validateField]);

  const handleFocus = useCallback((key: keyof RegisterForm) => {
    setFocusedField(key);
  }, []);

  // Button動畫
  const animateButton = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: BUTTON_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: BUTTON_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonScale]);

  // 主註冊邏輯
  const handleRegister = useCallback(async () => {
    const newErrors = getFormErrors(form, validateField);
    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) return;

    setLoading(true);
    try {
      await createUserData(form, auth, db);
      InteractionManager.runAfterInteractions(() => {
        router.replace({ pathname: '/(auth)/login', params: { justRegistered: '1' } });
      });
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      if (error.code === 'auth/email-already-in-use') {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (error.code === 'auth/weak-password') {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        Alert.alert('註冊失敗', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [form, validateField, router]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const navigateToLogin = useCallback(() => {
    router.replace('/(auth)/login');
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#0f6657" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Animated.Text style={[styles.headerText, { opacity: fadeAnim }]}>
            帳號註冊
          </Animated.Text>
        </View>
        <View style={styles.container}>
          <Image source={bgImg} style={styles.bgImage} />
          <Animated.View
            style={[
              styles.formArea,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* SLOGAN 只要沒 focus 才顯示 */}
            {!focusedField && (
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>建立您的帳戶</Text>
                <Text style={styles.welcomeSubtitle}>加入我們，開始您的旅程</Text>
              </View>
            )}

            {/* 姓名 */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>姓名</Text>
              <TextInput
                ref={nameInputRef}
                style={[
                  styles.input,
                  focusedField === 'name' && styles.inputFocused,
                  errors.name && styles.inputError,
                ]}
                placeholder="輸入姓名"
                value={form.name}
                onChangeText={value => handleChange('name', value)}
                onBlur={() => handleBlur('name')}
                onFocus={() => handleFocus('name')}
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />
              {touched.name && errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* 電子信箱 */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>電子信箱</Text>
              <TextInput
                ref={emailInputRef}
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused,
                  errors.email && styles.inputError,
                ]}
                placeholder="輸入電子信箱"
                value={form.email}
                onChangeText={value => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                onFocus={() => handleFocus('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* 密碼 */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>密碼</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordInputRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    focusedField === 'password' && styles.inputFocused,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="輸入密碼"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={value => handleChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  onFocus={() => handleFocus('password')}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.passwordToggle}
                  accessibilityLabel={showPassword ? '隱藏密碼' : '顯示密碼'}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
              {/* 密碼強度 */}
              {form.password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map(index => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          passwordStrengthInfo.strength >= index && {
                            backgroundColor: passwordStrengthInfo.color,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrengthInfo.color }]}>
                    密碼強度：{passwordStrengthInfo.text}
                  </Text>
                </View>
              )}
            </View>

            {/* 註冊按鈕 */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonLoading]}
                onPress={() => {
                  animateButton();
                  handleRegister();
                }}
                disabled={loading}
                accessibilityLabel="註冊按鈕"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.registerText}>註冊</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* 前往登入 */}
            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={navigateToLogin} accessibilityLabel="前往登入頁面">
                <Text style={styles.loginLink}>
                  已有帳號？<Text style={styles.loginLinkUnderline}>點我登入</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// === 樣式 ===
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f6657' },
  keyboardView: { flex: 1 },
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
    paddingTop: 36,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.5,
    height: width * 0.5,
    resizeMode: 'contain',
    opacity: 0.7,
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
  inputWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 6,
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
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 16,
    marginBottom: 8,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 16,
    marginBottom: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  strengthBar: {
    height: 4,
    width: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  strengthText: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#0f6657',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0f6657',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  registerButtonLoading: {
    backgroundColor: '#0f665799',
  },
  registerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginLink: {
    color: '#407700',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  loginLinkUnderline: {
    textDecorationLine: 'underline',
  },
});
