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

// 建立訂單
export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>) {
  const ref = collection(db, 'orders');
  const docRef = await addDoc(ref, {
    ...data,
    orderDate: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// 撈取會員的訂單
export async function getOrdersByMember(mbrId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('mbrId', '==', mbrId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as Order;
    return { ...data, id: doc.id }; // ✅ Firestore 的 id 最後補上
  });
}

// 撈取完成的訂單
export async function getCompletedOrders(mbrId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('mbrId', '==', mbrId),
    where('status', '==', '已完成'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as Order;
    return { ...data, id: doc.id };
  });
}
