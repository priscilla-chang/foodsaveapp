import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 持久化收藏（你提供的 useFavorites.ts）
import type { FavoriteStore as FavoriteEntry } from '../../../hooks/useFavorites';
import {
  getFavorites,
  toggleFavorite,
} from '../../../hooks/useFavorites';

// ====== 型別（本檔內用） ======
type ActiveOrder = {
  id: string;
  store: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string; // e.g. 今天 / 2025-04-24
  pickupTime: string; // 取餐時間
  latestPickupTime: string; // 最晚取餐時間
  status: '已確認' | '準備中' | '準備完成' | string;
  startTime: number; // 用來模擬狀態更新
};

type PastOrder = {
  id: string;
  store: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string;
  pickupTime: string;
  latestPickupTime: string;
  status: '已完成' | string;
};

// ====== 模擬資料 ======
const initialActiveOrders: ActiveOrder[] = [
  {
    id: '1',
    store: '綠意盎然有機食品商店',
    address: '台北市中山區南京東路123號',
    latitude: 25.0478,
    longitude: 121.5319,
    date: '今天',
    pickupTime: '12:45',
    latestPickupTime: '12:55',
    status: '已確認',
    startTime: Date.now(),
  },
];

const pastOrders: PastOrder[] = [
  {
    id: '2',
    store: '陽光冰店',
    address: '台北市信義區松壽路456號',
    latitude: 25.033,
    longitude: 121.5654,
    date: '2025-04-24',
    pickupTime: '13:00',
    latestPickupTime: '13:10',
    status: '已完成',
  },
];

// ====== 小工具：產生穩定的店家 id（避免用訂單 id） ======
const makeStoreId = (name: string, address: string) => `${name}@@${address}`;

// ====== 工具：依時間推進訂單狀態 ======
const getUpdatedOrderStatus = (order: ActiveOrder): ActiveOrder => {
  const elapsed = (Date.now() - order.startTime) / 1000; // 秒
  if (elapsed > 600) return { ...order, status: '準備完成' };
  if (elapsed > 300) return { ...order, status: '準備中' };
  return order;
};

// ====== 主畫面 ======
export default function OrdersListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'history' | 'favorites'>('active');
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(initialActiveOrders);

  // 收藏：用 AsyncStorage 持久化
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(new Set()); // 只存 ids
  const [favoriteList, setFavoriteList] = useState<FavoriteEntry[]>([]); // 我的收藏分頁資料

  // 啟動時載入收藏
  useEffect(() => {
    (async () => {
      const list = await getFavorites();
      setFavoriteList(list);
      setFavoriteSet(new Set(list.map((s) => s.id)));
    })();
  }, []);

  const reloadFavorites = async () => {
    const list = await getFavorites();
    setFavoriteList(list);
    setFavoriteSet(new Set(list.map((s) => s.id)));
  };

  // 每 10 秒模擬狀態推進
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrders((orders) => orders.map(getUpdatedOrderStatus));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ====== 共用：跳到地圖頁（使用你現有的 map.tsx） ======
  const goToMap = (p: { storeName: string; address: string; lat: number; lng: number }) => {
    router.push({
      pathname: '/orders/map', // 你的檔名為 app/(tabs)/orders/map.tsx
      params: {
        storeName: p.storeName,
        address: p.address,
        lat: String(p.lat),
        lng: String(p.lng),
      },
    });
  };

  // ====== 收藏切換 ======
  const doToggleFavorite = async (entry: FavoriteEntry) => {
    const nowFav = await toggleFavorite(entry);
    // 即時更新狀態
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

  // ====== Renderers ======
  const renderOrderItem: ListRenderItem<ActiveOrder | PastOrder> = ({ item }) => {
    const name = 'store' in item ? item.store : '';
    const addr = 'address' in item ? item.address : '';
    const lat = 'latitude' in item ? (item as any).latitude : 0;
    const lng = 'longitude' in item ? (item as any).longitude : 0;
    const storeId = makeStoreId(name, addr);
    const isFav = favoriteSet.has(storeId);

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.storeName}>{name}</Text>
          <TouchableOpacity
            onPress={() =>
              doToggleFavorite({ id: storeId, store: name, address: addr, latitude: lat, longitude: lng })
            }
            accessibilityRole="button"
            accessibilityLabel={isFav ? '取消收藏' : '加入收藏'}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#E95353' : '#999'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.address}>{addr}</Text>
        <Text style={styles.subtleText}>{'date' in item ? item.date : ''}</Text>
        {'status' in item && tab === 'active' ? (
          <Text style={styles.statusText}>目前進度：{(item as ActiveOrder).status}</Text>
        ) : null}

        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => goToMap({ storeName: name, address: addr, lat, lng })}
          >
            <Text style={styles.mapBtnText}>查看地圖</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push(`/orders/detail?id=${item.id}`)}
          >
            <Text style={styles.secondaryBtnText}>查看詳情</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFavoriteItem: ListRenderItem<FavoriteEntry> = ({ item }) => {
    const isFav = favoriteSet.has(item.id);
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.storeName}>{item.store}</Text>
          <TouchableOpacity
            onPress={() => doToggleFavorite(item)}
            accessibilityRole="button"
            accessibilityLabel={isFav ? '取消收藏' : '加入收藏'}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#E95353' : '#999'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.address}>{item.address}</Text>
        {/* 這裡我們只有持久化的基本欄位，若要顯示評分/距離/營業中狀態，可再加一層商家資料查詢 */}

        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() =>
              goToMap({ storeName: item.store, address: item.address, lat: item.latitude, lng: item.longitude })
            }
          >
            <Text style={styles.mapBtnText}>查看地圖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => {}}>
            <Text style={styles.secondaryBtnText}>立即訂購</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ====== Data & Renderer 選擇 ======
  let dataToShow: any[] = [];
  let renderFunc: ListRenderItem<any> = renderOrderItem; // 預設避免 TS 2322

  if (tab === 'active') {
    dataToShow = activeOrders;
    renderFunc = renderOrderItem as ListRenderItem<any>;
  } else if (tab === 'history') {
    dataToShow = pastOrders;
    renderFunc = renderOrderItem as ListRenderItem<any>;
  } else {
    dataToShow = favoriteList; // 來自 AsyncStorage 的收藏清單
    renderFunc = renderFavoriteItem as ListRenderItem<any>;
  }

  const emptyText = tab === 'favorites' ? '目前沒有收藏' : '目前沒有訂單';

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('active')}
          style={[styles.tabButton, tab === 'active' && styles.activeTab]}
        >
          <Text style={tab === 'active' ? styles.activeTabText : styles.tabText}>進行中</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('history')}
          style={[styles.tabButton, tab === 'history' && styles.activeTab]}
        >
          <Text style={tab === 'history' ? styles.activeTabText : styles.tabText}>歷史訂單</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('favorites')}
          style={[styles.tabButton, tab === 'favorites' && styles.activeTab]}
        >
          <Text style={tab === 'favorites' ? styles.activeTabText : styles.tabText}>我的收藏</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={dataToShow}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderFunc}
        ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
      />
    </View>
  );
}

// ====== 樣式（維持原始配色風格） ======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5', paddingTop: 20 },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20 },
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
  storeName: { fontSize: 18, fontWeight: '700' },
  address: { fontSize: 14, color: '#666', marginTop: 4 },
  subtleText: { fontSize: 14, color: '#999', marginTop: 4 },
  statusText: { fontSize: 14, color: '#0A6859', marginTop: 8, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
  rowActions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  mapBtn: { backgroundColor: '#0A6859', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  mapBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#e7efe7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  secondaryBtnText: { color: '#0A6859', fontWeight: '700' },
});
