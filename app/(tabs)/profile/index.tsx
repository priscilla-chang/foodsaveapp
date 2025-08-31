// profile/index.tsx
import { Link } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 功能選單型別
type MenuItem = { title: string; route: string };

export default function ProfileScreen() {
  const menuItems: MenuItem[] = [
    { title: '我的帳戶',        route: '/profile/account' },
    { title: '我的碳足跡',      route: '/profile/carbon' },
    { title: '查看集點卡',      route: '/profile/reward-card' },
    { title: '點數紀錄',        route: '/profile/reward-history' },
    { title: '我的折價券',      route: '/profile/coupons' },
    // 🔑 這兩個實際導向到 /orders
    { title: '歷史訂單紀錄',    route: '/orders/history' },
    { title: '我的收藏店家',    route: '/orders/favorites' },
    { title: '常見問題',        route: '/profile/faq' },
    { title: '隱私政策',        route: '/profile/privacy' },
    { title: '關於',            route: '/profile/about' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 頭像區塊 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>個人中心</Text>
          <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
          <Text style={styles.name}>使用者名稱</Text>
          <Text style={styles.description}>這裡可以放用戶描述、信箱</Text>
        </View>

        {/* 功能清單 */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Link key={item.title} href={item.route as any} asChild>
              <Pressable style={styles.menuButton}>
                <Text style={styles.menuText}>{item.title}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f2e5' },
  header: { backgroundColor: '#2D5B50', paddingVertical: 32, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  description: { color: '#ccc', fontSize: 14 },
  menuList: { paddingHorizontal: 20, marginTop: 20 },
  menuButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuText: { fontSize: 16, fontWeight: '500', color: '#2D5B50' },
});
