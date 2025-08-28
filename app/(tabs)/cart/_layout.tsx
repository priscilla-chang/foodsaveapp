import { Stack } from 'expo-router';
import React from 'react';

export default function CartLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0A6859',
        headerTitleAlign: 'center',
        headerShadowVisible: true,
      }}
    >
      {/* Tab 主頁：購物車 */}
      <Stack.Screen
        name="index"
        options={{ title: '購物車', headerBackVisible: false }}
      />

      {/* 下單完成頁：pickup */}
      <Stack.Screen
        name="pickup"
        options={{ title: '取貨資訊' }}
      />
    </Stack>
  );
}
