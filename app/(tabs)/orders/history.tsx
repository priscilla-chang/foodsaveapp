import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthProvider';
import { getCompletedOrders } from '../../services/order';
import { Order } from '../../types/order';

export default function OrderHistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const orders = await getCompletedOrders(user.uid);
      setHistory(orders);
    })();
  }, [user]);

  const renderOrder = ({ item }: { item: Order }) => {
    const safeDate = new Date(item.orderDate).toLocaleString();
    return (
      <View style={styles.card}>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.date}>{safeDate}</Text>
        <Text style={styles.amount}>總金額：${item.totalPrice}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>目前沒有歷史訂單</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5', paddingTop: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeName: { fontSize: 18, fontWeight: '700' },
  date: { fontSize: 14, color: '#666', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '600', marginTop: 6 },
  status: { fontSize: 14, color: '#0A6859', fontWeight: '700', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});
