// app/types/order.ts

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
};

export type Order = {
  id: string;
  mbrId: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
  items: OrderItem[];
  totalPrice: number;
  pickupTime: string;
  pickupMethod: '外帶'; // ✅ 固定為「外帶」
  paymentMethod: string;
  orderDate: string;
  status: string;
  createdAt?: any;
  pickupCode: string; // ✅ 取貨代碼
};
