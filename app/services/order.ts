import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../firestore/firebase';
import { Order } from '../types/order';

// 建立單筆訂單
export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>) {
  const ref = collection(db, 'orders');
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// 撈取會員所有訂單
export async function getOrdersByMember(mbrId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('mbrId', '==', mbrId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<Order, 'id'>;
    return { id: doc.id, ...data };
  });
}
