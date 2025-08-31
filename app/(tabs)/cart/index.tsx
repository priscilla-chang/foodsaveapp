import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../../contexts/CartContext';
import CouponModal, { Coupon } from '../../components/CouponModal';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );
  const discount = selectedCoupon ? Math.floor(subtotal * selectedCoupon.discountRate) : 0;
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('購物車是空的');
      return;
    }
    // TODO: 建立訂單
    clearCart();
    setSelectedCoupon(null);
    router.push('/(tabs)/cart/pickup');
  };

  const renderItem = ({ item }: { item: typeof cartItems[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? <Text style={styles.desc} numberOfLines={1}>{item.description}</Text> : null}
        <Text style={styles.price}>${item.price}</Text>

        {/* 橫向加減 */}
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={styles.qtyBtn}>
            <Ionicons name="remove" size={18} color="#2D5B50" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
            <Ionicons name="add" size={18} color="#2D5B50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 右側刪除 */}
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color="#D6336C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.page}>
      {/* Header with SafeArea */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>購物車</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyBox}>
          {/* 用線上圖避免資產路徑問題 */}
          <Image
            source={{ uri: 'https://i.postimg.cc/50mXKZ2w/empty-cart-illustration.png' }}
            style={{ width: 180, height: 180, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 16, color: '#666' }}>購物車是空的</Text>
          <TouchableOpacity style={styles.goShopBtn} onPress={() => router.replace('/')}>
            <Text style={styles.goShopText}>去逛逛</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        />
      )}

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.total}>小計：${subtotal}</Text>
          {selectedCoupon ? (
            <>
              <Text style={styles.couponText}>已套用：{selectedCoupon.label} (-${discount})</Text>
              <TouchableOpacity onPress={() => setSelectedCoupon(null)}>
                <Text style={styles.cancelCoupon}>取消使用優惠券</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setCouponModalVisible(true)}>
              <Text style={styles.couponSelect}>選擇優惠券</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.finalTotal}>總金額：${total}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>送出訂單</Text>
        </TouchableOpacity>
      </View>

      {/* 優惠券 Modal */}
      <CouponModal
        visible={couponModalVisible}
        coupons={[
          { id: 'c1', label: '95折優惠', min: 100, discountRate: 0.05 },
          { id: 'c2', label: '9折優惠',  min: 200, discountRate: 0.10 },
        ]}
        selectedCoupon={selectedCoupon}
        subtotal={subtotal}
        onSelect={setSelectedCoupon}
        onClose={() => setCouponModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFF6EF' },
  header: {
    backgroundColor: '#2D5B50',
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12,
    elevation: 2, marginBottom: 12, alignItems: 'center',
  },
  image: { width: 72, height: 72, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 12, color: '#666', marginVertical: 2 },
  price: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#2D5B50',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { width: 32, textAlign: 'center', fontWeight: '600' },

  deleteBtn: { padding: 6, marginLeft: 6 },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  goShopBtn: { marginTop: 16, backgroundColor: '#2D5B50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  goShopText: { color: '#fff', fontWeight: '700' },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row',
    padding: 16, borderTopWidth: 1, borderColor: '#E7E1D8', backgroundColor: '#fff',
    alignItems: 'center',
  },
  total: { fontSize: 14, color: '#444' },
  couponText: { fontSize: 13, color: '#0A6859', marginTop: 4 },
  couponSelect: { fontSize: 13, color: '#007AFF', marginTop: 4 },
  cancelCoupon: { fontSize: 13, color: '#D6336C', marginTop: 4 },
  finalTotal: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  checkoutBtn: { backgroundColor: '#2D5B50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
