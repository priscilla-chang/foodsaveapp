import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Coupon = {
  id: string;
  label: string;
  min: number;
  discountRate: number;
};

type CouponModalProps = {
  readonly visible: boolean;
  readonly coupons: readonly Coupon[];
  readonly selectedCoupon: Coupon | null;
  readonly subtotal: number;
  readonly onSelect: (coupon: Coupon | null) => void;
  readonly onClose: () => void;
};

export default function CouponModal({
  visible,
  coupons,
  selectedCoupon,
  subtotal,
  onSelect,
  onClose,
}: CouponModalProps) {
  const isCouponUsable = (coupon: Coupon) => subtotal >= coupon.min;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {coupons.map((coupon) => (
            <TouchableOpacity
              key={coupon.id}
              onPress={() => {
                if (isCouponUsable(coupon)) {
                  onSelect(coupon);
                  onClose();
                }
              }}
              style={[styles.card, !isCouponUsable(coupon) && { opacity: 0.4 }]}
              disabled={!isCouponUsable(coupon)}
            >
              <Text>{coupon.label}</Text>
              <Text style={styles.minText}>滿 ${coupon.min} 可使用</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => {
              onSelect(null); // ✅ 現在合法
              onClose();
            }}
            style={[styles.card, { backgroundColor: '#2D5B50', borderWidth: 1, borderColor: '#ccc' }]}
          >
            <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>
              不使用折價券
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  card: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  minText: {
    fontSize: 12,
    color: '#888',
  },
});
