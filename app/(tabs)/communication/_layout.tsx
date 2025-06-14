import { Stack } from 'expo-router';
import React from 'react';
import { GoalProvider } from './GoalContext';

export default function CommunicationLayout() {
  return (
    <GoalProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleAlign: 'center',
          headerTintColor: '#0f6657',
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: '智能小虎', headerBackVisible: false }}
        />
        <Stack.Screen name="chat" options={{ title: '聊天' }} />
        <Stack.Screen name="goal" options={{ title: '設定目標' }} />
        <Stack.Screen name="goal-list" options={{ title: '我的目標' }} />
        <Stack.Screen name="completed" options={{ title: '完成清單' }} />
      </Stack>
    </GoalProvider>
  );
}
