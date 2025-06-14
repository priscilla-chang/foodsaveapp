import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

// Icon 組件定義（避免 SonarLint 警告）
const HomeIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
);
const SearchIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="search" size={size} color={color} />
);
const OrdersIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="receipt" size={size} color={color} />
);
const ChatIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="chatbubbles" size={size} color={color} />
);
const ProfileIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="person" size={size} color={color} />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f6657', height: 65 },
        tabBarActiveTintColor: '#FBA808',
        tabBarInactiveTintColor: '#ffffff',
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '首頁', tabBarIcon: HomeIcon }} />
      <Tabs.Screen name="search" options={{ title: '搜尋', tabBarIcon: SearchIcon }} />
      <Tabs.Screen name="orders" options={{ title: '訂單', tabBarIcon: OrdersIcon }} />
      <Tabs.Screen name="communication" options={{ title: '聊天', tabBarIcon: ChatIcon }} />
      <Tabs.Screen name="profile" options={{ title: '我的', tabBarIcon: ProfileIcon }} />
    </Tabs>
  );
}
