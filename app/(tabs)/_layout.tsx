import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { CartProvider } from '../../contexts/CartContext'; // 引入 CartProvider

// 圖示定義
const HomeIcon = ({ color }: { color: ColorValue }) => <Ionicons name="home-outline" size={24} color={color} />;
const CartIcon = ({ color }: { color: ColorValue }) => <Ionicons name="cart-outline" size={24} color={color} />;
const OrdersIcon = ({ color }: { color: ColorValue }) => <Ionicons name="list-outline" size={24} color={color} />;
const ChatIcon = ({ color }: { color: ColorValue }) => <Ionicons name="chatbubble-outline" size={24} color={color} />;
const ProfileIcon = ({ color }: { color: ColorValue }) => <Ionicons name="person-outline" size={24} color={color} />;

export default function TabLayout() {
  return (
    <CartProvider>
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
        <Tabs.Screen name="cart" options={{ title: '購物車', tabBarIcon: CartIcon }} />
        <Tabs.Screen name="orders" options={{ title: '訂單', tabBarIcon: OrdersIcon }} />
        <Tabs.Screen name="communication" options={{ title: '聊天', tabBarIcon: ChatIcon }} />
        <Tabs.Screen name="profile" options={{ title: '我的', tabBarIcon: ProfileIcon }} />
      </Tabs>
    </CartProvider>
  );
}
