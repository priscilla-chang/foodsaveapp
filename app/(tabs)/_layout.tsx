import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

// 定義每個 Tab 的圖標
const HomeIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
);
const CartIcon = ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name="cart" size={size} color={color} />
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
      {/* 對應 app/(tabs)/index.tsx */}
      <Tabs.Screen name="index" options={{ title: '首頁', tabBarIcon: HomeIcon }} />
      {/* 對應 app/(tabs)/cart.tsx */}
      <Tabs.Screen name="cart" options={{ title: '購物車', tabBarIcon: CartIcon }} />
      {/* 對應 app/(tabs)/orders/index.tsx 或 app/(tabs)/orders.tsx */}
      <Tabs.Screen name="orders" options={{ title: '訂單', tabBarIcon: OrdersIcon }} />
      {/* 對應 app/(tabs)/communication/index.tsx 或 app/(tabs)/communication.tsx */}
      <Tabs.Screen name="communication" options={{ title: '聊天', tabBarIcon: ChatIcon }} />
      {/* 對應 app/(tabs)/profile/index.tsx 或 app/(tabs)/profile.tsx */}
      <Tabs.Screen name="profile" options={{ title: '我的', tabBarIcon: ProfileIcon }} />
    </Tabs>
  );
}
