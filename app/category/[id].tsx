import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView, StatusBar, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'; // ✅ 換成 React Native
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../firestore/firebase';
import { FavoriteStore, getFavorites, toggleFavorite } from '../../hooks/useFavorites';

type Store = {
  id: string;
  name: string;
  address?: string;
  imageUrl?: string;
  distance?: number;
  categoryId?: string;
  categories?: string[];
  couponLabel?: string;
  latitude?: number;
  longitude?: number;
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stores, setStores] = useState<Store[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const catRef = doc(db, 'categories', id);
      const catSnap = await getDoc(catRef);
      const label = (catSnap.exists() ? (catSnap.data() as any).label : '') ?? '';
      setCategoryName(label);

      const strategies: [field: string, op: '==' | 'array-contains', value: string][] = [
        ['categoriesId', '==', id],
        ['categoryId', '==', id],
        ['categories', 'array-contains', id],
      ];
      if (label) strategies.push(['categories', 'array-contains', label]);

      const collected = new Map<string, Store>();
      for (const [field, op, value] of strategies) {
        const qx = query(collection(db, 'store'), where(field as any, op as any, value));
        const snap = await getDocs(qx);
        snap.forEach(d => {
          const data = d.data() as Omit<Store, 'id'>;
          if (!collected.has(d.id)) {
            collected.set(d.id, { id: d.id, ...data });
          }
        });
        if (collected.size > 0) break;
      }

      setStores([...collected.values()]);

      const favs = await getFavorites();
      setFavoriteSet(new Set(favs.map(f => f.id)));
    } catch (e) {
      console.error('❌ 載入分類資料失敗:', e);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const empty = useMemo(() => !loading && stores.length === 0, [loading, stores]);

  const handleToggleFavorite = async (store: Store) => {
    const entry: FavoriteStore = {
      id: store.id,
      store: store.name,
      address: store.address ?? '未提供地址',
      latitude: store.latitude ?? 0,
      longitude: store.longitude ?? 0,
    };
    const nowFav = await toggleFavorite(entry);
    setFavoriteSet(prev => {
      const next = new Set(prev);
      if (nowFav) next.add(store.id);
      else next.delete(store.id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* ✅ 改用原生 StatusBar */}
      <StatusBar barStyle="light-content" backgroundColor="#0A6859" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backHitbox}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName || '分類'}</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0A6859" />
            <Text style={{ marginTop: 10, color: '#666' }}>載入中…</Text>
          </View>
        ) : empty ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              這個分類目前沒有店家{'\n'}（請檢查 Firestore store 文件是否有正確的分類欄位）
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
              <Text style={styles.retryText}>重新整理</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {stores.map((store) => {
              const isFav = favoriteSet.has(store.id);
              return (
                <TouchableOpacity
                  key={store.id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/store/${store.id}`)}
                >
                  <Image
                    source={{ uri: store.imageUrl || 'https://via.placeholder.com/120' }}
                    style={styles.image}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>{store.name}</Text>
                    <Text style={styles.address}>{store.address ?? '未提供地址'}</Text>
                    <Text style={styles.meta}>
                      距離：約 {store.distance?.toFixed(1) ?? '0'} 公里
                    </Text>
                    {store.couponLabel && (
                      <View style={styles.couponTag}>
                        <Text style={styles.couponText}>{store.couponLabel}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteBtn}
                    onPress={() => handleToggleFavorite(store)}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isFav ? '#E95353' : '#999'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A6859' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A6859',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backHitbox: { paddingHorizontal: 12, paddingVertical: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 'bold', color: '#fff' },
  headerRightSpacer: { width: 40 },

  content: { flex: 1, backgroundColor: '#f8f2e5' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  address: { fontSize: 13, color: '#666' },
  meta: { fontSize: 12, color: '#999', marginTop: 2 },
  couponTag: {
    marginTop: 6,
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  couponText: { fontSize: 12, color: '#E95353', fontWeight: '600' },
  favoriteBtn: { position: 'absolute', top: 10, right: 10 },

  retryBtn: {
    marginTop: 16,
    backgroundColor: '#0A6859',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
