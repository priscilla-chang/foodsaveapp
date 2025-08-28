import { useRouter, type Href } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../firestore/firebase';

const screenWidth = Dimensions.get('window').width;

type Category = {
  id: string;       // ✅ Firestore doc.id
  imageUrl: string;
  label: string;
};
type StoreCard = {
  storeId: string;
  imageUrl: string;
  name: string;
  distance?: number;
};

const bannerImages = [
  require('../../assets/images/a.jpg'),
  require('../../assets/images/b.jpg'),
  require('../../assets/images/c.jpg'),
];

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [nearbyStores, setNearbyStores] = useState<StoreCard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const fetchData = async () => {
    try {
      const catSnap = await getDocs(collection(db, 'categories'));
      const storeSnap = await getDocs(collection(db, 'store'));

      const catData: Category[] = catSnap.docs.map((doc) => {
        const d = doc.data() as Partial<Category>;
        return {
          id: doc.id,   // ✅ Firestore doc.id
          imageUrl: d.imageUrl ?? '',
          label: d.label ?? '',
        };
      });

      const allStores: StoreCard[] = storeSnap.docs.map((doc) => {
        const d = doc.data() as Partial<StoreCard>;
        return {
          storeId: d.storeId ?? doc.id,
          imageUrl: d.imageUrl ?? '',
          name: d.name ?? '',
          distance: d.distance,
        };
      });

      const recommended = [...allStores].sort(() => Math.random() - 0.5).slice(0, 5);
      const nearby = [...allStores]
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, 5);

      setCategories(catData);
      setStores(recommended);
      setNearbyStores(nearby);
    } catch (err) {
      console.error('❌ Firestore 錯誤:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 搜尋框 */}
        <View style={styles.innerContainer}>
          <View style={styles.searchBox}>
            <Image source={require('../../assets/images/搜尋.jpg')} style={styles.searchIcon} />
            <TextInput placeholder="Search" placeholderTextColor="#999" style={styles.searchInput} />
          </View>
        </View>

        {/* 輪播圖 */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.bannerScroll}
        >
          {bannerImages.map((img, i) => (
            <Image
              key={`banner-${i}`}
              source={img}
              style={{ width: screenWidth - 32, height: 160, borderRadius: 12, marginHorizontal: 16 }}
            />
          ))}
        </ScrollView>

        {/* 指示點 */}
        <View style={styles.dotRow}>
          {bannerImages.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[styles.dot, { backgroundColor: activeIndex === i ? '#333' : '#ccc' }]}
            />
          ))}
        </View>

        {/* 分類 */}
        <View style={styles.innerContainer}>
          <Text style={styles.sectionTitle}>分類</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoriesItem, { marginLeft: 12, marginRight: 12 }]}
              onPress={() => router.push(`/category/${item.id}` as Href)}  // ✅ doc.id 傳到 CategoryScreen
            >
              <Image source={{ uri: item.imageUrl }} style={styles.categoriesImage} />
              <Text style={styles.categoriesText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 推薦 */}
        <View style={styles.innerContainer}>
          <Text style={styles.sectionTitle}>為您推薦</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stores.map((store) => (
            <TouchableOpacity
              key={store.storeId}
              style={[styles.productCard, { marginLeft: 16, marginRight: 12 }]}
              onPress={() => router.push(`/store/${store.storeId}` as Href)}
            >
              <Image source={{ uri: store.imageUrl }} style={styles.productImage} />
              <Text style={styles.productName}>{store.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 附近 */}
        <View style={styles.innerContainer}>
          <Text style={styles.sectionTitle}>附近店家</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyStores.map((store) => (
            <TouchableOpacity
              key={store.storeId}
              style={[styles.productCard, { marginLeft: 16, marginRight: 12 }]}
              onPress={() => router.push(`/store/${store.storeId}` as Href)}
            >
              <Image source={{ uri: store.imageUrl }} style={styles.productImage} />
              <Text style={styles.productName}>{store.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F2E6' },
  innerContainer: { paddingHorizontal: 16 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
    shadowRadius: 2, elevation: 3,
  },
  searchIcon: { width: 20, height: 20, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  bannerScroll: { marginBottom: 12 },
  dotRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  categoriesScroll: { marginBottom: 20 },
  categoriesItem: { alignItems: 'center' },
  categoriesImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 4 },
  categoriesText: { fontSize: 12, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  productCard: { borderRadius: 12, padding: 10, width: 160 },
  productImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  productName: { fontSize: 14, marginBottom: 4 },
});
