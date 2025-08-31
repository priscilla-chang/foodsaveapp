import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../contexts/CartContext';
import { db } from '../../firestore/firebase';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  storeId: string;
};

type StoreInfo = {
  id: string;
  name: string;
  address?: string;
  imageUrl?: string;
  distance?: number;
  star?: number;
  latitude?: number;
  longitude?: number;
};

const defaultCover =
  'https://via.placeholder.com/800x400.png?text=Store+Cover';
const defaultAvatar =
  'https://via.placeholder.com/200.png?text=Store+Avatar';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { addToCart } = useCart();

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal 狀態
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 讀取店家
      const storeRef = doc(db, 'store', id);
      const storeSnap = await getDoc(storeRef);
      if (storeSnap.exists()) {
        setStore({ id: storeSnap.id, ...(storeSnap.data() as Omit<StoreInfo, 'id'>) });
      }

      // 嘗試讀取子集合 products
      let productList: Product[] = [];
      const subColSnap = await getDocs(collection(db, 'store', id, 'products'));
      if (!subColSnap.empty) {
        productList = subColSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }));
      } else {
        // 如果子集合沒有 → 嘗試讀扁平集合
        const productRef = collection(db, 'products');
        const q = query(productRef, where('storeId', '==', id));
        const flatSnap = await getDocs(q);
        productList = flatSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }));
      }
      setProducts(productList);
    } catch (err) {
      console.error('❌ 讀取店家資料失敗:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = () => {
    if (!selectedProduct || !store) return;

    addToCart({
      productId: selectedProduct.id,
      id: `${selectedProduct.id}-${Date.now()}`,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
      image: selectedProduct.imageUrl ?? '',
      description: selectedProduct.description ?? '',
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address ?? '',
      latitude: store.latitude ?? 0,
      longitude: store.longitude ?? 0,
    });

    setModalVisible(false);
    setQuantity(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0A6859" />
          <Text style={{ marginTop: 10, color: '#666' }}>載入中…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={{ fontSize: 16, color: '#666' }}>找不到店家資訊</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>重新整理</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{store.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 店家封面 + 頭像 */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{ uri: store.imageUrl || defaultCover }}
            style={styles.bannerImage}
          />
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: store.imageUrl || defaultAvatar }}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* 店家資訊 */}
        <View style={{ paddingTop: 50, alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.meta}>
            {store.star ?? '3.7'} ★ ・ {store.distance ?? 0} KM
          </Text>
        </View>

        {/* 為您推薦 */}
        <Text style={styles.sectionTitle}>為您推薦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
          {products.slice(0, 3).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() => {
                setSelectedProduct(p);
                setQuantity(1);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: p.imageUrl || defaultAvatar }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text style={styles.cardPrice}>${p.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 人氣精選 */}
        <Text style={styles.sectionTitle}>人氣精選</Text>
        <View style={styles.verticalList}>
          {products.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.rowCard}
              onPress={() => {
                setSelectedProduct(p);
                setQuantity(1);
                setModalVisible(true);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                {p.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {p.description}
                  </Text>
                )}
                <Text style={styles.cardPrice}>${p.price}</Text>
              </View>
              <Image source={{ uri: p.imageUrl || defaultAvatar }} style={styles.rowImage} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            {selectedProduct && (
              <>
                <Image
                  source={{ uri: selectedProduct.imageUrl || defaultAvatar }}
                  style={modalStyles.image}
                />
                <Text style={modalStyles.productName}>{selectedProduct.name}</Text>
                <Text style={modalStyles.productPrice}>${selectedProduct.price}</Text>

                {/* 數量選擇 */}
                <View style={modalStyles.quantityContainer}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Text style={modalStyles.quantityButton}>-</Text>
                  </TouchableOpacity>
                  <Text style={modalStyles.quantityText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                    <Text style={modalStyles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* 總價 */}
                <Text style={modalStyles.totalPrice}>
                  總計：${selectedProduct.price * quantity}
                </Text>

                {/* 按鈕區 */}
                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={modalStyles.cancelText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.addBtn]}
                    onPress={handleAddToCart}
                  >
                    <Text style={modalStyles.addText}>加入購物車</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 前往購物車按鈕 */}
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
        <Text style={styles.cartButtonText}>前往購物車</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f2e5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5B50',
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  headerBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  bannerWrapper: { width: '100%', height: 160, position: 'relative' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarWrapper: {
    position: 'absolute',
    bottom: -40,
    left: '50%',
    transform: [{ translateX: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    padding: 3,
    zIndex: 10,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 40 },

  storeName: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  meta: { fontSize: 14, color: '#666', marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },

  cardRow: { paddingHorizontal: 16, marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    width: 140,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 100, resizeMode: 'cover', borderRadius: 8, marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '500' },
  cardPrice: { color: '#444', fontSize: 13, marginTop: 2 },

  verticalList: { paddingHorizontal: 16, gap: 12 },
  rowCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowImage: { width: 60, height: 60, borderRadius: 8 },

  cardDesc: { fontSize: 13, color: '#666', marginVertical: 4 },
  cardPriceVertical: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },

  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2D5B50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  retryBtn: { marginTop: 16, backgroundColor: '#0A6859', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  productName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  productPrice: { fontSize: 18, fontWeight: '600', color: '#2D5B50', textAlign: 'center', marginBottom: 12 },
  quantityContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  quantityButton: { fontSize: 24, paddingHorizontal: 20, color: '#2D5B50' },
  quantityText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#2D5B50', textAlign: 'center', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f5f5f5' },
  cancelText: { color: '#666', fontWeight: '600' },
  addBtn: { backgroundColor: '#2D5B50' },
  addText: { color: '#fff', fontWeight: 'bold' },
});
