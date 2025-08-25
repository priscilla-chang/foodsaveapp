// app/services/orders.ts
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firestore/firebase';
import { Order } from '../types/order';

// 新增訂單
export async function addOrder(order: Omit<Order, 'id'>) {
  const docRef = await addDoc(collection(db, 'orders'), order);
  return docRef.id;
}

// 取得全部訂單
export async function getAllOrders() {
  const q = query(collection(db, 'orders'));
  const querySnapshot = await getDocs(q);
  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() } as Order);
  });
  return orders;
}

// 取得已完成訂單
export async function getCompletedOrders() {
  const q = query(collection(db, 'orders'), where('status', '==', '已完成'));
  const querySnapshot = await getDocs(q);
  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() } as Order);
  });
  return orders;
}
