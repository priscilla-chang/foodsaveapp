// app/(tabs)/orders/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthProvider';
import { FavoriteStore, getFavorites, toggleFavorite } from '../../../hooks/useFavorites';
import { getOrdersByMember } from '../../services/order';
import { Order } from '../../types/order';

export default function OrdersListScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [tab, setTab] = useState<'active' | 'favorites'>('active');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [favoriteList, setFavoriteList] = useState<FavoriteStore[]>([]);
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(new Set());

  // 讀取訂單
  useEffect(() => {
    if (!user) return;
    (async () => {
      const orders = await getOrdersByMember(user.uid);
      setActiveOrders(orders.filter((o) => o.status !== '已完成'));
    })();
  }, [user]);

  // 讀取收藏
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

  const renderOrderItem = ({ item }: { item: Order }) => {
    const safeDate = new Date(item.orderDate ?? Date.now()).toLocaleString();

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.storeName}>{item.storeName}</Text>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.date}>{safeDate}</Text>
        <Text style={styles.amount}>總金額：${item.totalPrice}</Text>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => router.push(`/orders/detail?id=${item.id}`)}
        >
          <Text style={styles.detailBtnText}>查看詳情</Text>
        </TouchableOpacity>
      </View>
    );
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
        <Text style={styles.date}>{item.address}</Text>
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
            onPress={() => router.push(`/store/${item.id}`)}
          >
            <Text style={styles.secondaryBtnText}>立即訂購</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('active')}
          style={[styles.tabButton, tab === 'active' && styles.activeTab]}
        >
          <Text style={tab === 'active' ? styles.activeTabText : styles.tabText}>
            進行中
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('favorites')}
          style={[styles.tabButton, tab === 'favorites' && styles.activeTab]}
        >
          <Text style={tab === 'favorites' ? styles.activeTabText : styles.tabText}>
            我的收藏
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {tab === 'active' ? (
        <FlatList
          data={activeOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderOrderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>目前沒有進行中訂單</Text>}
        />
      ) : (
        <FlatList
          data={favoriteList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderFavoriteItem}
          ListEmptyComponent={<Text style={styles.emptyText}>目前沒有收藏</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5', paddingTop: 20 },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 16, color: '#666' },
  activeTab: { borderBottomWidth: 2, borderColor: '#0A6859' },
  activeTabText: { fontSize: 16, color: '#0A6859', fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
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
  date: { fontSize: 14, color: '#666', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '600', marginTop: 6 },
  statusText: { fontSize: 14, color: '#FF9500', fontWeight: '700' },
  rowActions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  mapBtn: { backgroundColor: '#0A6859', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  mapBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#e7efe7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  secondaryBtnText: { color: '#0A6859', fontWeight: '700' },
  detailBtn: {
    marginTop: 10,
    backgroundColor: '#0A6859',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailBtnText: { color: '#fff', fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});
