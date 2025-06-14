import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firestore/firebase'; // 根據你的實際路徑調整

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'orders'), where('mbrID', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, [userId]);

  return orders;
}
