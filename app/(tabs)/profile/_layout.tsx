import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#2D5B50',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerStyle: { backgroundColor: '#fff' },
      }}
    >
      {/* 📌 統一在這裡命名各頁標題 */}
      <Stack.Screen name="index" options={{ title: '個人中心' }} />
      <Stack.Screen name="account" options={{ title: '我的帳戶' }} />
      <Stack.Screen name="co2" options={{ title: '我的碳足跡' }} />
      <Stack.Screen name="reward-card" options={{ title: '集點卡' }} />
      <Stack.Screen name="reward-history" options={{ title: '點數紀錄' }} />
      <Stack.Screen name="coupons" options={{ title: '我的折價券' }} />
      <Stack.Screen name="order-history" options={{ title: '歷史訂單紀錄' }} />
      <Stack.Screen name="favorites" options={{ title: '我的收藏店家' }} />
      <Stack.Screen name="faq" options={{ title: '常見問題' }} />
      <Stack.Screen name="privacy" options={{ title: '隱私政策' }} />
      <Stack.Screen name="about" options={{ title: '關於' }} />
    </Stack>
  );
}
