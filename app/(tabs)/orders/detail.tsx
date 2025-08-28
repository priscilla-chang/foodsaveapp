import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../../../firestore/firebase';
import { Order } from '../../types/order';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        setOrder({ id: snap.id, ...(snap.data() as Omit<Order, 'id'>) });
      }
    })();
  }, [id]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>載入中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>訂單詳情</Text>
      <Text>店家：{order.storeName}</Text>
      <Text>狀態：{order.status}</Text>
      <Text>時間：{order.orderDate}</Text>
      <Text>總金額：${order.totalPrice}</Text>

      <Text style={styles.subtitle}>商品列表</Text>
      {order.items.map((item) => (
        <View key={item.productId} style={styles.itemRow}>
          <Text>{item.name}</Text>
          <Text>x{item.quantity}</Text>
          <Text>${item.price}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
