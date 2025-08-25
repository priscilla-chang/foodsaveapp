// app/types/order.ts
export type OrderItem = {
  productId: string; // 商品 ID
  name: string; // 商品名稱
  price: number; // 單價
  quantity: number; // 數量
};

export type Order = {
  id: string; // 訂單 ID（Firebase 自動生成）
  storeId: string; // 店家 ID
  storeName: string; // 店家名稱
  items: OrderItem[]; // 購買的商品
  totalPrice: number; // 總金額
  orderDate: string; // 訂單日期（字串，例：2025-08-12）
  pickupMethod: '外帶'; // 固定為外帶
  paymentMethod: '現金'; // 固定為現金
  status: '進行中' | '已完成'; // 訂單狀態
};
