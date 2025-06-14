export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  store: string;
  address: string;
  date: string;
  pickupTime: string;
  latestPickupTime: string;
  latitude: number;
  longitude: number;
  status: '已確認' | '準備中' | '準備完成' | '已完成';
  items: OrderItem[];
  paymentMethod: string;
  paid: boolean;
  startTime?: number;
}

export function useOrders(): Order[] {
  return [
    {
      id: '1',
      store: '綠意盎然有機食品商店',
      address: '台北市中山區南京東路123號',
      latitude: 25.0478,
      longitude: 121.5319,
      date: '今天',
      pickupTime: '12:45',
      latestPickupTime: '12:55',
      status: '準備中',
      items: [
        { name: '西瓜', quantity: 1, price: 10.99 },
        { name: '西洋梨', quantity: 2, price: 8.99 },
      ],
      paymentMethod: '到店付款',
      paid: false,
    },
    {
      id: '2',
      store: '陽光冰店',
      address: '台北市信義區松壽路456號',
      latitude: 25.033,
      longitude: 121.5654,
      date: '2025-04-24',
      pickupTime: '13:00',
      latestPickupTime: '13:10',
      status: '已完成',
      items: [{ name: '芒果冰', quantity: 1, price: 5.99 }],
      paymentMethod: '到店付款',
      paid: true,
    },
  ];
}
