// app/(tabs)/orders/favorites.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FavoriteStore } from '../../../hooks/useFavorites';
import { getFavorites, toggleFavorite } from '../../../hooks/useFavorites';

export default function FavoritesScreen() {
  const [favoriteList, setFavoriteList] = useState<FavoriteStore[]>([]);
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const list = await getFavorites();
      setFavoriteList(list);
      setFavoriteSet(new Set(list.map((s) => s.id)));
    })();
  }, []);

  const doToggleFavorite = async (entry: FavoriteStore) => {
    const nowFav = await toggleFavorite(entry);
    if (nowFav) {
      setFavoriteSet((prev) => new Set(prev).add(entry.id));
      setFavoriteList((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
    } else {
      setFavoriteSet((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
      setFavoriteList((prev) => prev.filter((e) => e.id !== entry.id));
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteStore }) => {
    const isFav = favoriteSet.has(item.id);
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.storeName}>{item.store}</Text>
          <TouchableOpacity onPress={() => doToggleFavorite(item)}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? '#E95353' : '#999'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.address}>{item.address}</Text>
        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() =>
              router.push({
                pathname: '/orders/map',
                params: {
                  storeName: item.store,
                  address: item.address,
                  lat: String(item.latitude),
                  lng: String(item.longitude),
                },
              })
            }
          >
            <Text style={styles.mapBtnText}>查看地圖</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push(`/store/${item.id}`)} // ✅ 直接跳轉 store/[id]
          >
            <Text style={styles.secondaryBtnText}>立即訂購</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteList}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>目前沒有收藏</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5' },
  listContent: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: 18, fontWeight: '700' },
  address: { fontSize: 14, color: '#666', marginTop: 4 },
  rowActions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  mapBtn: {
    backgroundColor: '#0A6859',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mapBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#e7efe7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  secondaryBtnText: { color: '#0A6859', fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});
