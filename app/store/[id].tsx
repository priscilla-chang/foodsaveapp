import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
import { useCart } from '../../contexts/CartContext';
import { db } from '../../firestore/firebase';

export default function StoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const storeId = Array.isArray(id) ? id[0] : id;

  const { addToCart, cartItems } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [storeInfo, setStoreInfo] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!storeId || typeof storeId !== 'string') return;
    try {
      const q1 = query(collection(db, 'products'), where('storeId', '==', storeId));
      const q2 = query(collection(db, 'store'), where('storeId', '==', storeId));
      const [productSnap, storeSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);

      const productData = productSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      productData.sort(() => Math.random() - 0.5);

      if (!storeSnap.empty) {
        setStoreInfo(storeSnap.docs[0].data());
      }
      setProducts(productData);
    } catch (err) {
      console.error('❌ 重新載入錯誤:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openModal = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setModalVisible(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    addToCart({
      productId: selectedProduct.productId,
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
      image: selectedProduct.imageUrl,
      description: selectedProduct.description,
      storeId,
      storeName: storeInfo?.name ?? '未知店家',
      storeAddress: storeInfo?.address ?? '未提供地址',
      latitude: storeInfo?.latitude ?? 0,
      longitude: storeInfo?.longitude ?? 0,
    });
    setModalVisible(false);
  };

  return (
    <View style={styles.pageWrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{storeInfo?.name ?? '載入中...'}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.bannerWrapper}>
          <Image source={{ uri: storeInfo?.imageUrl }} style={styles.bannerImage} />
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: storeInfo?.imageUrl }} style={styles.avatar} />
          </View>
        </View>

        <View style={{ paddingTop: 50 }}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{storeInfo?.name}</Text>
            <Text style={styles.shopMeta}>
              {storeInfo?.star?.toFixed(1) ?? '4.0'}★ ・ {storeInfo?.distance?.toFixed(1) ?? '0'}KM
            </Text>
          </View>
        </View>

        {/* 為您推薦 */}
        <Text style={styles.sectionTitle}>為您推薦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
          {products.map((product) => (
            <TouchableOpacity key={product.id} style={styles.card} onPress={() => openModal(product)}>
              <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{product.name}</Text>
              <Text style={styles.cardPrice}>${product.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 人氣精選 */}
        <Text style={styles.sectionTitle}>人氣精選</Text>
        <View style={styles.verticalList}>
          {products.map((product) => (
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

      {/* 商品 Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* 右上角關閉 ❌ */}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>

              <Image source={{ uri: selectedProduct?.imageUrl }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
              <Text style={styles.modaltext}>{selectedProduct?.description}</Text>

              <View style={styles.quantityRow}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Text style={styles.qtyButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                  <Text style={styles.qtyButton}>+</Text>
                </TouchableOpacity>
              </View>
              <Pressable style={styles.addButton} onPress={handleAddToCart}>
                <Text style={styles.addButtonText}>加入購物車</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 前往購物車 */}
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
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
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: { position: 'absolute', top: 10, right: 10, padding: 6 },
  modalImage: { width: 100, height: 100, marginBottom: 12, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modaltext: { fontSize: 16, color: '#444', marginTop: 10, marginBottom: 4, textAlign: 'center' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyButton: { fontSize: 24, width: 32, textAlign: 'center' },
  qtyText: { fontSize: 16, marginHorizontal: 8 },
  addButton: { backgroundColor: '#2D5B50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },

  // 前往購物車
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
});
