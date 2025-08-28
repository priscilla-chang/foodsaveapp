import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorites:v2'; // ⚠️ 建議改 v2，避免跟舊資料混淆

export type FavoriteStore = {
  id: string;        // ⚡️ 這裡直接存 Firestore 的 storeId
  store: string;
  address: string;
  latitude: number;
  longitude: number;
};

async function read(): Promise<FavoriteStore[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function write(list: FavoriteStore[]) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}

export async function getFavorites() {
  return await read();
}

export async function isFavorite(id: string) {
  const list = await read();
  return list.some(s => s.id === id);
}

export async function toggleFavorite(item: FavoriteStore) {
  const list = await read();
  const exists = list.some(s => s.id === item.id);
  const next = exists ? list.filter(s => s.id !== item.id) : [item, ...list];
  await write(next);
  return !exists; // true = 已收藏
}

export async function removeFavorite(id: string) {
  const list = await read();
  await write(list.filter(s => s.id !== id));
}
