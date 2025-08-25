import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firestore/firebase';

type StoreItem = {
  id: string;
  name: string;
  imageUrl: string;
  storeId: string;
};

export default function CategoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<StoreItem[]>([]);

  useEffect(() => {
    const fetchCategoryStores = async () => {
      try {
        const colRef = collection(db, 'stores'); // 假設你有一個 stores collection
        const q = query(colRef, where('category', '==', id)); // 用分類查詢

        const snapshot = await getDocs(q);

        const storeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<StoreItem, 'id'>),
        }));

        setItems(storeList);
      } catch (error) {
        console.error('資料載入失敗', error);
      }
    };

    if (id) {
      fetchCategoryStores();
    }
  }, [id]);

  const renderItem = ({ item }: { item: StoreItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '../store/[id]',
          params: { id: item.storeId }, // ❗ 確保你的頁面路由是 /store/[id].tsx
        })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>分類：{id}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>找不到任何資料</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
  },
});
