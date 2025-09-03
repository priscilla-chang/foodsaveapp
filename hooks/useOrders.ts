import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { Order } from '../app/types/order';
import { db } from '../firestore/firebase';

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'orders'),
      where('mbrId', '==', userId),   // ⚠️ 確認欄位名稱是 mbrId
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data() as any;
        return {
          ...raw,
          id: doc.id,
          createdAt: raw.createdAt?.toDate?.() ?? raw.createdAt,
        } as Order;
      });
      setOrders(data);
    });

    return () => unsubscribe();
  }, [userId]);

  return orders;
}
