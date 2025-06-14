import { Stack } from 'expo-router';
import React from 'react';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0A6859',
        headerTitleAlign: 'center',
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: '我的訂單', headerBackVisible: false }} />
      <Stack.Screen name="detail" options={{ title: '訂單詳情' }} />
      <Stack.Screen name="map" options={{ title: '店家地圖' }} />
    </Stack>
  );
}
