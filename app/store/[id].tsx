// app/store/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { db } from '../../firestore/firebase';
import { useCart } from '../contexts/CartContext';

// ---- 型別 ----
type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  storeId: string;
};

type StoreInfo = {
  storeId: string;
  name: string;
  imageUrl: string;
  star?: number;
  distance?: number;
};

export default function StoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const storeId = Array.isArray(id) ? id[0] : id;

  const { addToCart, clearCart, cartItems } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!storeId || typeof storeId !== 'string') return;

    try {
      const qProducts = query(collection(db, 'products'), where('storeId', '==', storeId));
      const qStore = query(collection(db, 'store'), where('storeId', '==', storeId));
      const [productSnap, storeSnap] = await Promise.all([getDocs(qProducts), getDocs(qStore)]);

      const productData: Product[] = productSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: String(data.name ?? ''),
          price: Number(data.price ?? 0),
          imageUrl: String(data.imageUrl ?? ''),
          description: data.description ? String(data.description) : undefined,
          storeId: String(data.storeId ?? storeId),
        };
      });

      productData.sort(() => Math.random() - 0.5);
      setProducts(productData);

      if (!storeSnap.empty) {
        const s = storeSnap.docs[0].data();
        const next: StoreInfo = {
          storeId: String(s.storeId ?? storeId),
          name: String(s.name ?? ''),
          imageUrl: String(s.imageUrl ?? ''),
          star: typeof s.star === 'number' ? s.star : undefined,
          distance: typeof s.distance === 'number' ? s.distance : undefined,
        };
        setStoreInfo(next);
      } else {
        setStoreInfo(null);
      }
    } catch (err) {
      console.error('❌ 重新載入錯誤:', err);
    }
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setModalVisible(true);
  };

  const getCartStoreId = cartItems.length > 0 ? cartItems[0].storeId : null;

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (getCartStoreId && getCartStoreId !== storeId) {
      setPendingProduct(selectedProduct);
      setModalVisible(false);
      setConfirmVisible(true);
      return;
    }

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
      image: selectedProduct.imageUrl,
      description: selectedProduct.description ?? '', // ← 保證 string
      storeId: typeof storeId === 'string' ? storeId : '',
    });
    setModalVisible(false);
  };

  const confirmClearAndAdd = () => {
    if (!pendingProduct) return;
    clearCart();
    addToCart({
      id: pendingProduct.id,
      name: pendingProduct.name,
      price: pendingProduct.price,
      quantity,
      image: pendingProduct.imageUrl,
      description: pendingProduct.description ?? '', // ← 保證 string
      storeId: typeof storeId === 'string' ? storeId : '',
    });
    setConfirmVisible(false);
    setPendingProduct(null);
  };

  return (
    <View style={styles.pageWrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{storeInfo?.name ?? '載入中...'}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.bannerWrapper}>
          <Image source={{ uri: storeInfo?.imageUrl || undefined }} style={styles.bannerImage} />
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: storeInfo?.imageUrl || undefined }} style={styles.avatar} />
          </View>
        </View>

        <View style={{ paddingTop: 50 }}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{storeInfo?.name ?? ''}</Text>
            <Text style={styles.shopMeta}>
              {(storeInfo?.star ?? 4.0).toFixed(1)}★ ・ {(storeInfo?.distance ?? 0).toFixed(1)}KM
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>為您推薦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
          {products.map((product: Product) => (
            <TouchableOpacity key={product.id} style={styles.card} onPress={() => openModal(product)}>
              <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{product.name}</Text>
              <Text style={styles.cardPrice}>${product.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>人氣精選</Text>
        <View style={styles.verticalList}>
          {products.map((product: Product) => (
            <TouchableOpacity key={product.id} style={styles.rowCard} onPress={() => openModal(product)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{product.name}</Text>
                <Text style={styles.cardPrice}>${product.price}</Text>
              </View>
              <Image source={{ uri: product.imageUrl }} style={styles.rowImage} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 商品詳情 Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedProduct?.imageUrl || undefined }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedProduct?.name ?? ''}</Text>
              <Text style={styles.modaltext}>{selectedProduct?.description ?? ''}</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Text style={styles.qtyButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity((q) => q + 1)}>
                  <Text style={styles.qtyButton}>+</Text>
                </TouchableOpacity>
              </View>
              <Pressable style={styles.addButton} onPress={handleAddToCart}>
                <Text style={styles.addButtonText}>加入購物車</Text>
              </Pressable>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ marginTop: 12, color: '#888' }}>關閉</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 不同店家確認 Modal */}
      <Modal visible={confirmVisible} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View style={styles.confirmModalOverlay}>
            <View style={styles.confirmModalContent}>
              <Text style={styles.modalTitle}>店家不同</Text>
              <Text style={styles.modaltext}>
                {`購物車已有其他店家的商品，\n是否清空購物車並加入新商品？`}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Pressable
                  style={[styles.confirmButton, { backgroundColor: '#aaa' }]}
                  onPress={() => setConfirmVisible(false)}
                >
                  <Text style={styles.addButtonText}>取消</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmButton, { marginLeft: 10 }]}
                  onPress={confirmClearAndAdd}
                >
                  <Text style={styles.addButtonText}>清空並加入</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 導到 tabs 的購物車 */}
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
        <Text style={styles.cartButtonText}>前往購物車</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#F9F2E6' },
  header: {
    backgroundColor: '#2D5B50',
    paddingTop: 68,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: { color: '#fff', fontSize: 24, marginRight: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerWrapper: { width: '100%', height: 160, backgroundColor: '#eee', position: 'relative' },
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
  shopInfo: { alignItems: 'center', marginBottom: 16 },
  shopName: { fontSize: 18, fontWeight: 'bold' },
  shopMeta: { color: '#666', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },
  cardRow: { paddingHorizontal: 16, marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    width: 140,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '80%', alignItems: 'center' },
  modalImage: { width: 100, height: 100, marginBottom: 12, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modaltext: { fontSize: 16, color: '#444', marginTop: 10, marginBottom: 4, textAlign: 'center' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyButton: { fontSize: 24, width: 32, textAlign: 'center' },
  qtyText: { fontSize: 16, marginHorizontal: 8 },
  addButton: { backgroundColor: '#2D5B50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#2D5B50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  cartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  confirmModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmModalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center' },
  confirmButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#2D5B50' },
});
