import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';

import { AuthProvider, useAuth } from '../contexts/AuthProvider'; // ✅ 從根目錄
import { CartProvider } from '../contexts/CartContext'; // ✅ 從根目錄
import { PointsProvider } from '../contexts/PointsContext'; // ✅ 從根目錄

export default function RootLayout() {
  return (
    <AuthProvider>
      <PointsProvider>
        <CartProvider>
          {/* ✅ 全域 StatusBar */}
          <StatusBar barStyle="light-content" backgroundColor="#2D5B50" />
          <AuthGate />
        </CartProvider>
      </PointsProvider>
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 未登入且不在 (auth) → 強制導向 login
    if (!user && segments[0] !== '(auth)') {
      router.replace('/(auth)/login');
    }

    // 已登入且還在 (auth) → 導向 tabs 主頁
    if (user && segments[0] === '(auth)') {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2D5B50" /> 
      </View>
    );
  }

  return <Slot />;
}
