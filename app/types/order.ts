export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
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
  pickupMethod: '外帶';
  paymentMethod: '現金';
  orderDate: string;
  status: '進行中' | '已完成';
  createdAt?: any;
};
