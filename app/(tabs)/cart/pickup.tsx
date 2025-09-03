import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type OrderInfo = { storeName: string; time: string; code: string; name: string };

export default function PickupPage() {
  const router = useRouter();
  const { orders } = useLocalSearchParams<{ orders: string }>();
  const orderList: OrderInfo[] = orders ? JSON.parse(orders) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>訂單已送出！</Text>

        <FlatList
          data={orderList}
          keyExtractor={(item, idx) => `${item.code}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.infoBox}>
              <Text style={styles.label}>顧客</Text>
              <Text style={styles.value}>{item.name}</Text>

              <Text style={styles.label}>店家</Text>
              <Text style={styles.value}>{item.storeName}</Text>

              <Text style={styles.label}>取貨時間</Text>
              <Text style={styles.value}>
                {new Date(item.time).toLocaleString('zh-TW')}
              </Text>

              <Text style={styles.label}>取貨碼</Text>
              <Text style={[styles.value, styles.code]}>{item.code}</Text>
            </View>
          )}
        />

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>返回首頁</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF6EF' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D5B50', marginBottom: 20 },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  label: { fontSize: 14, color: '#888', marginTop: 8 },
  value: { fontSize: 18, color: '#333', fontWeight: '600' },
  code: { fontSize: 24, color: '#D6336C', letterSpacing: 2, marginTop: 4 },
  button: {
    marginTop: 20,
    backgroundColor: '#2D5B50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
