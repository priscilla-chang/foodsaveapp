import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../../contexts/CartContext';
import CouponModal, { Coupon } from '../../components/CouponModal';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = selectedCoupon
    ? Math.floor(subtotal * selectedCoupon.discountRate)
    : 0;

  const total = subtotal - discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('購物車是空的');
      return;
    }

    // TODO: 建立 Firestore 訂單
    clearCart();
    setSelectedCoupon(null);

    router.push('/(tabs)/cart/pickup');
  };

  const renderItem = ({ item }: { item: typeof cartItems[0] }) => (
    <View style={styles.card}>
      {/* 商品圖片 */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* 商品資訊 */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.price}>
          ${item.price} x {item.quantity}
        </Text>

        {/* 加減按鈕橫向排列 */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyCount}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 刪除 icon */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#D6336C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        // 空購物車美化
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#bbb" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>購物車是空的</Text>
          <Text style={styles.emptySubtitle}>快去挑選喜歡的商品吧！</Text>
          <TouchableOpacity
            style={styles.goShopBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.goShopText}>去逛逛</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* 優惠券 / 小計 / 總金額 */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.total}>小計：${subtotal}</Text>
          {selectedCoupon ? (
            <>
              <Text style={styles.couponText}>
                已套用：{selectedCoupon.label} (-${discount})
              </Text>
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
          { id: 'c2', label: '9折優惠', min: 200, discountRate: 0.1 },
        ]}
        selectedCoupon={selectedCoupon}
        subtotal={subtotal}
        onSelect={(c) => setSelectedCoupon(c)}
        onClose={() => setCouponModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6EF' },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 12, color: '#666', marginVertical: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginHorizontal: 5,
  },
  qtyText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  qtyCount: { fontSize: 16, fontWeight: '600', color: '#000' },
  deleteBtn: { padding: 6 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  goShopBtn: {
    backgroundColor: '#2D5B50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goShopText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  total: { fontSize: 14, color: '#444' },
  couponText: { fontSize: 13, color: '#0A6859', marginTop: 4 },
  couponSelect: { fontSize: 13, color: '#007AFF', marginTop: 4 },
  cancelCoupon: { fontSize: 13, color: '#D6336C', marginTop: 4 },
  finalTotal: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  checkoutBtn: {
    backgroundColor: '#2D5B50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'center',
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
