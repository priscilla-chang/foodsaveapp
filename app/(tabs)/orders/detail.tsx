import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressStepper from './ProgressStepper';

const ordersData = [
  {
    id: '1',
    store: '綠意盎然有機食品商店',
    address: '台北市中山區南京東路123號',
    latitude: 25.0478,
    longitude: 121.5319,
    date: '今天',
    pickupTime: '12:45',
    latestPickupTime: '12:55',
    status: '準備中',
    items: [
      { name: '西瓜', quantity: 1, price: 10.99 },
      { name: '西洋梨', quantity: 2, price: 8.99 },
    ],
    paymentMethod: '到店付款',
    paid: false,
  },
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
    items: [{ name: '芒果冰', quantity: 1, price: 5.99 }],
    paymentMethod: '到店付款',
    paid: true,
  },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const order = ordersData.find((o) => o.id === id);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>找不到訂單資料！</Text>
      </View>
    );
  }

  const calculateTotal = (items: any[]) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.statusBanner}>
        <Text style={styles.pickupTimeText}>預計取餐時間：{order.pickupTime}</Text>
        <ProgressStepper status={order.status as '已確認' | '準備中' | '準備完成'} />
        <Text style={styles.latestPickupText}>最晚取餐時間：{order.latestPickupTime}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>訂單資訊</Text>
        <Text style={styles.detailText}>訂單編號：#ABC{id}</Text>
        <Text style={styles.detailText}>下單時間：{order.date}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{order.store}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={20} color="#0A6859" style={{ marginRight: 8 }} />
          <Text style={styles.detailText}>{order.address}</Text>
        </View>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() =>
            router.push(
              `/orders/map?lat=${order.latitude}&lng=${order.longitude}&storeName=${encodeURIComponent(order.store)}&address=${encodeURIComponent(order.address)}`
            )
          }
        >
          <Text style={styles.navigateButtonText}>地圖</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>訂單明細</Text>
        {order.items.map((item, idx) => (
          <Text key={`${item.name}-${item.quantity}`} style={styles.detailText}>
             {item.name} × {item.quantity} - ${item.price.toFixed(2)}
          </Text>
        ))}
        <Text style={[styles.detailText, { marginTop: 10, fontWeight: '700' }]}>
          總金額：${calculateTotal(order.items)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>付款資訊</Text>
        <Text style={styles.detailText}>付款方式：{order.paymentMethod}</Text>
        {!order.paid && (
          <Text style={[styles.detailText, { color: '#FF9500', fontWeight: '700' }]}>
            尚未付款
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#f8f2e5' },
  statusBanner: {
    backgroundColor: '#FFF4CC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  pickupTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  latestPickupText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A6859',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  navigateButton: {
    marginTop: 10,
    backgroundColor: '#0A6859',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
