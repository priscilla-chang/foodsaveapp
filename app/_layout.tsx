import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PointsProvider } from '../contexts/PointsContext'; // 根據你的專案路徑調整
import { AuthProvider, useAuth } from './AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 未登入時不在 (auth) 頁面群組 → 強制導向 login
    if (!user && segments[0] !== '(auth)') {
      router.replace('/(auth)/login');
    }
    // 已登入時還在 (auth) 頁面群組 → 強制導向主頁或 tabs
    if (user && segments[0] === '(auth)') {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  // 讀取中顯示轉圈
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ★★★ 已登入 + 在 tabs 群組，包 PointsProvider（所有 tab 子頁都能用 usePoints）
  if (user && segments[0] === '(tabs)') {
    return (
      <PointsProvider>
        <Slot />
      </PointsProvider>
    );
  }

  // 其他情況直接顯示頁面（例如 auth 頁面）
  return <Slot />;
}
