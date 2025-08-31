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
  pickupMethod: string;
  paymentMethod: string;
  orderDate: string;
  status: string;
  createdAt?: any;
  pickupCode: string; // ✅ 新增，避免 type error
};
