import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const initialActiveOrders = [
  {
    id: '1',
    store: '綠意盎然有機食品商店',
    address: '台北市中山區南京東路123號',
    latitude: 25.0478,
    longitude: 121.5319,
    date: '今天',
    pickupTime: '12:45',
    latestPickupTime: '12:55',
    status: '已確認',
    startTime: Date.now(),
  },
];

const pastOrders = [
  {
    id: '2',
    store: '陽光冰店',
    address: '台北市信義區松壽路456號',
    latitude: 25.033,
    longitude: 121.5654,
    date: '2025-04-24',
    pickupTime: '13:00',
    latestPickupTime: '13:10',
    status: '已完成',
  },
];

const getUpdatedOrderStatus = (order: any) => {
  const elapsed = (Date.now() - order.startTime) / 1000;
  if (elapsed > 600) return { ...order, status: '準備完成' };
  if (elapsed > 300) return { ...order, status: '準備中' };
  return order;
};

export default function OrdersListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrders((orders) => orders.map(getUpdatedOrderStatus));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/detail?id=${item.id}`)}
    >
      <Text style={styles.storeName}>{item.store}</Text>
      <Text style={styles.orderAddress}>{item.address}</Text>
      <Text style={styles.orderDate}>{item.date}</Text>
      {tab === 'active' && (
        <Text style={styles.statusText}>目前進度：{item.status}</Text>
      )}
    </TouchableOpacity>
  );

  const dataToShow = tab === 'active' ? activeOrders : pastOrders;

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('active')}
          style={[styles.tabButton, tab === 'active' && styles.activeTab]}
        >
          <Text style={tab === 'active' ? styles.activeTabText : styles.tabText}>進行中</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('history')}
          style={[styles.tabButton, tab === 'history' && styles.activeTab]}
        >
          <Text style={tab === 'history' ? styles.activeTabText : styles.tabText}>歷史訂單</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataToShow}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderOrderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>目前沒有訂單</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5', paddingTop: 20 },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20 },
  tabText: { fontSize: 16, color: '#666' },
  activeTab: { borderBottomWidth: 2, borderColor: '#0A6859' },
  activeTabText: { fontSize: 16, color: '#0A6859', fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  orderAddress: { fontSize: 14, color: '#666' },
  orderDate: { fontSize: 14, color: '#999', marginTop: 4 },
  statusText: {
    fontSize: 14,
    color: '#0A6859',
    marginTop: 8,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
