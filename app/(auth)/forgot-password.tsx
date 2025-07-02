import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity,
  View
} from 'react-native'
import { auth } from '../../firestore/firebase'

const { width } = Dimensions.get('window')

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  // 只留主內容淡入滑入
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const inputRef = useRef<TextInput>(null)

  // 主內容進場動畫
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim])

  // 提示自動消失
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 1700)
      return () => clearTimeout(timer)
    }
  }, [msg])

  // 檢查 email 格式
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  // 提示
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    if (type === 'error') inputRef.current?.focus()
  }

  // 發送重設信
  const handleReset = useCallback(async () => {
    if (!email.trim()) return showMsg('error', '請輸入電子信箱')
    if (!validateEmail(email.trim())) return showMsg('error', '電子信箱格式錯誤')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setEmail('')
      showMsg('success', '重設信已寄送，請至信箱確認')
      setTimeout(() => router.replace({ pathname: '/(auth)/login', params: { reset: '1' } }), 1200)
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') return showMsg('error', '此電子信箱未註冊')
      if (err.code === 'auth/invalid-email') return showMsg('error', '電子信箱格式無效')
      if (err.code === 'auth/too-many-requests') return showMsg('error', '嘗試過多，請稍後再試')
      return showMsg('error', err.message ?? '發送失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }, [email, router])

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0f6657" />
      <LinearGradient colors={['#0f6657', '#1a8a77']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* 返回按鈕 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8}>
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={20} color="white" />
              </BlurView>
            </TouchableOpacity>
          </View>
          {/* 提示 */}
          {msg && (
            <View style={styles.toast}>
              <BlurView intensity={60} style={styles.toastBlur}>
                <Text style={[
                  styles.toastText,
                  { color: msg.type === 'success' ? '#4caf50' : '#fff' }
                ]}>
                  {msg.type === 'success' ? '✅ ' : '⚠️ '} {msg.text}
                </Text>
              </BlurView>
            </View>
          )}
          {/* 主內容淡入滑入 */}
          <Animated.View style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            {/* 靜態 icon */}
            <View style={styles.iconContainer}>
              <BlurView intensity={16} style={styles.iconBlur}>
                <Text style={styles.iconText}>🔐</Text>
              </BlurView>
            </View>
            <Text style={styles.title}>忘記密碼？</Text>
            <Text style={styles.subtitle}>輸入電子信箱，寄送重設連結給您</Text>
            {/* 輸入框 */}
            <View style={styles.inputContainer}>
              <BlurView intensity={8} style={styles.inputBlur}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="請輸入電子信箱"
                  placeholderTextColor="rgba(51,51,51,0.6)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
                <Ionicons name="mail-outline" size={20} color="rgba(51,51,51,0.5)" style={styles.inputIcon} />
              </BlurView>
            </View>
            {/* 發送按鈕 */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonLoading]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.93}
            >
              <LinearGradient
                colors={loading ? ['#678', '#aaa'] : ['#000', '#333']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{loading ? '發送中...' : '發送重設連結'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* 返回登入 */}
            <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8} disabled={loading}>
              <BlurView intensity={8} style={styles.backLinkBlur}>
                <Text style={styles.backLinkText}>返回登入頁面</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f6657' },
  gradient: { flex: 1 },
  header: { paddingTop: 20, paddingHorizontal: 24, paddingBottom: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  backButtonBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)' },
  toast: { position: 'absolute', top: 100, left: 24, right: 24, zIndex: 1000, borderRadius: 16, overflow: 'hidden' },
  toastBlur: { padding: 16, backgroundColor: 'rgba(60,60,60,0.9)' },
  toastText: { fontSize: 16, textAlign: 'center', fontWeight: '500' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36 },
  iconContainer: { width: 80, height: 80, borderRadius: 25, marginBottom: 24, overflow: 'hidden' },
  iconBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  iconText: { fontSize: 36 },
  title: { fontSize: 26, color: 'white', marginBottom: 10, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.86)', textAlign: 'center', marginBottom: 32, lineHeight: 22, maxWidth: 270 },
  inputContainer: { width: '100%', marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
  inputBlur: { backgroundColor: 'rgba(255,255,255,0.97)', flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 18, fontSize: 16, color: '#333' },
  inputIcon: { marginRight: 16 },
  button: { width: width - 48, marginTop: 18, borderRadius: 16, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 18, paddingHorizontal: 24 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  buttonLoading: { opacity: 0.7 },
  backLink: { marginTop: 32, borderRadius: 12, overflow: 'hidden' },
  backLinkBlur: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.09)' },
  backLinkText: { color: 'rgba(255,255,255,0.93)', fontSize: 16, textAlign: 'center', fontWeight: '500' },
})
