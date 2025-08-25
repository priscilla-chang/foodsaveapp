// app/(tabs)/profile/_layout.tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#F9F2E6',  // 返回鍵與右側圖示顏色
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerStyle: { backgroundColor: '#2D5B50' }, // Header 背景色
      }}
    />
  );
}
