import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createOrder } from '../../firestore/order';

export default function TestOrderScreen() {
  const handleCreateOrder = async () => {
    try {
      const ordNo = await createOrder({
        mbrId: 'test001',
        paymentMethod: 'Cash',
        pickupTime: new Date(Date.now() + 60 * 60 * 1000),
        note: '這是測試訂單',
        orderDetails: [
          { prodNo: 'P001', quantity: 2, unitPrice: 50 },
          { prodNo: 'P002', quantity: 1, unitPrice: 100 },
        ],
      });

      Alert.alert('✅ 成功送出訂單', `訂單編號：${ordNo}`);
    } catch (error) {
      console.error(error);
      Alert.alert('❌ 發生錯誤', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 模擬訂單明細</Text>

      <View style={styles.card}>
        <Text style={styles.store}>綠意盎然有機商店</Text>
        <Text style={styles.item}>P001 有機胡蘿蔔 × 2 - $50</Text>
        <Text style={styles.item}>P002 有機番茄 × 1 - $100</Text>
        <Text style={styles.total}>總金額：$200</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreateOrder}>
        <Text style={styles.buttonText}>✅ 送出訂單</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#0A6859' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  store: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#0A6859' },
  item: { fontSize: 16, color: '#333', marginBottom: 6 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#E67700', marginTop: 12 },
  button: {
    backgroundColor: '#0A6859',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
