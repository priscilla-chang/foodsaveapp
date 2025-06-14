import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Types and Interfaces
export interface Order {
  ordNo: string;                    // 訂單編號
  mbrId: string;                    // 會員編號 (Foreign Key)
  ordStatus: OrderStatus;           // 訂單狀態
  paymentStatus: PaymentStatus;     // 付款狀態
  paymentMethod: PaymentMethod;     // 付款方式
  ordType: OrderType;               // 訂單類型
  pickupTime: Date;                 // 取貨時間
  actualPickupTime?: Date;          // 實際取貨時間
  cancelReason?: string;            // 取消原因
  rating?: number;                  // 評分 (1-5)
  comment?: string;                 // 評論
  note?: string;                    // 備註
  totalAmount: number;              // 訂單總金額
  createdAt: Timestamp;             // 建立時間
  updatedAt: Timestamp;             // 更新時間
}

export interface OrderDetail {
  ordDtlNo: string;         // 訂單明細編號
  ordNo: string;            // 訂單編號 (Foreign Key)
  prodNo: string;           // 商品編號 (Foreign Key)
  quantity: number;         // 購買數量
  unitPrice: number;        // 單價
  subtotal: number;         // 小計
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Paid';
export type PaymentMethod = 'Cash' | 'CreditCard' | 'PayPal';
export type OrderType = 'Standard' | 'Preorder';

export interface CreateOrderData {
  mbrId: string;
  paymentMethod: PaymentMethod;
  ordType?: OrderType;
  pickupTime: Date;
  note?: string;
  orderDetails: CreateOrderDetailData[];
}

export interface CreateOrderDetailData {
  prodNo: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateOrderData {
  ordStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  pickupTime?: Date;
  actualPickupTime?: Date;
  cancelReason?: string;
  rating?: number;
  comment?: string;
  note?: string;
}

// Collection references
const orderCollection = collection(db, 'orders');
const orderDetailCollection = collection(db, 'orderDetails');

// Utility functions
export const generateOrdNo = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `O${timestamp}`;
};

export const generateOrdDtlNo = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `OD${timestamp}${random}`;
};

// CRUD Operations
export const createOrder = async (data: CreateOrderData): Promise<string> => {
  const batch = writeBatch(db);
  
  try {
    const ordNo = generateOrdNo();
    
    // Calculate total amount
    const totalAmount = data.orderDetails.reduce(
      (total, detail) => total + (detail.quantity * detail.unitPrice), 
      0
    );
    
    // Create order document
    const orderData: Omit<Order, 'ordNo'> = {
      mbrId: data.mbrId,
      ordStatus: 'Pending',
      paymentStatus: 'Unpaid',
      paymentMethod: data.paymentMethod,
      ordType: data.ordType ?? 'Standard',
      pickupTime: data.pickupTime,
      note: data.note,
      totalAmount,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const orderDocRef = doc(orderCollection);
    batch.set(orderDocRef, { ordNo, ...orderData });

    // Create order detail documents
    for (const detail of data.orderDetails) {
      const ordDtlNo = generateOrdDtlNo();
      const subtotal = detail.quantity * detail.unitPrice;
      
      const orderDetailData: OrderDetail = {
        ordDtlNo,
        ordNo,
        prodNo: detail.prodNo,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal,
      };

      const detailDocRef = doc(orderDetailCollection);
      batch.set(detailDocRef, orderDetailData);
    }

    await batch.commit();
    return ordNo;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

export const getOrderById = async (ordNo: string): Promise<Order | null> => {
  try {
    const q = query(orderCollection, where('ordNo', '==', ordNo));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      ...data,
      pickupTime: data.pickupTime.toDate(),
      actualPickupTime: data.actualPickupTime?.toDate(),
    } as Order;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
};

export const getOrdersByMember = async (mbrId: string): Promise<Order[]> => {
  try {
    const q = query(
      orderCollection,
      where('mbrId', '==', mbrId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        pickupTime: data.pickupTime.toDate(),
        actualPickupTime: data.actualPickupTime?.toDate(),
      };
    }) as Order[];
  } catch (error) {
    console.error('Error getting orders by member:', error);
    throw new Error('Failed to get member orders');
  }
};

export const getOrdersByStatus = async (status: OrderStatus): Promise<Order[]> => {
  try {
    const q = query(
      orderCollection,
      where('ordStatus', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        pickupTime: data.pickupTime.toDate(),
        actualPickupTime: data.actualPickupTime?.toDate(),
      };
    }) as Order[];
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw new Error('Failed to get orders by status');
  }
};

export const getOrderDetails = async (ordNo: string): Promise<OrderDetail[]> => {
  try {
    const q = query(orderDetailCollection, where('ordNo', '==', ordNo));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data()) as OrderDetail[];
  } catch (error) {
    console.error('Error getting order details:', error);
    throw new Error('Failed to get order details');
  }
};

export const getOrderWithDetails = async (ordNo: string): Promise<{
  order: Order | null;
  details: OrderDetail[];
}> => {
  try {
    const [order, details] = await Promise.all([
      getOrderById(ordNo),
      getOrderDetails(ordNo)
    ]);

    return { order, details };
  } catch (error) {
    console.error('Error getting order with details:', error);
    throw new Error('Failed to get order with details');
  }
};

export const updateOrder = async (ordNo: string, data: UpdateOrderData): Promise<void> => {
  try {
    const q = query(orderCollection, where('ordNo', '==', ordNo));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Order not found');
    }
    
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
};

export const confirmOrder = async (ordNo: string): Promise<void> => {
  try {
    await updateOrder(ordNo, { ordStatus: 'Confirmed' });
  } catch (error) {
    console.error('Error confirming order:', error);
    throw new Error('Failed to confirm order');
  }
};

export const completeOrder = async (ordNo: string, actualPickupTime?: Date): Promise<void> => {
  try {
    await updateOrder(ordNo, { 
      ordStatus: 'Completed',
      actualPickupTime: actualPickupTime || new Date()
    });
  } catch (error) {
    console.error('Error completing order:', error);
    throw new Error('Failed to complete order');
  }
};

export const cancelOrder = async (ordNo: string, cancelReason: string): Promise<void> => {
  try {
    await updateOrder(ordNo, { 
      ordStatus: 'Cancelled',
      cancelReason
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error('Failed to cancel order');
  }
};

export const rateOrder = async (ordNo: string, rating: number, comment?: string): Promise<void> => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    await updateOrder(ordNo, { rating, comment });
  } catch (error) {
    console.error('Error rating order:', error);
    throw new Error('Failed to rate order');
  }
};

export const markOrderAsPaid = async (ordNo: string): Promise<void> => {
  try {
    await updateOrder(ordNo, { paymentStatus: 'Paid' });
  } catch (error) {
    console.error('Error marking order as paid:', error);
    throw new Error('Failed to mark order as paid');
  }
};

export const deleteOrder = async (ordNo: string): Promise<void> => {
  const batch = writeBatch(db);
  
  try {
    // Delete order details first
    const detailsQuery = query(orderDetailCollection, where('ordNo', '==', ordNo));
    const detailsSnapshot = await getDocs(detailsQuery);
    
    detailsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete order
    const orderQuery = query(orderCollection, where('ordNo', '==', ordNo));
    const orderSnapshot = await getDocs(orderQuery);
    
    if (!orderSnapshot.empty) {
      batch.delete(orderSnapshot.docs[0].ref);
    }

    await batch.commit();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
};

// Analytics functions
export const getTotalOrderValue = async (mbrId: string): Promise<number> => {
  try {
    const orders = await getOrdersByMember(mbrId);
    const completedOrders = orders.filter(order => order.ordStatus === 'Completed');
    
    return completedOrders.reduce((total, order) => total + order.totalAmount, 0);
  } catch (error) {
    console.error('Error calculating total order value:', error);
    throw new Error('Failed to calculate total order value');
  }
};

export const getOrderStatistics = async (mbrId: string): Promise<{
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageRating: number;
}> => {
  try {
    const orders = await getOrdersByMember(mbrId);
    
    const completedOrders = orders.filter(order => order.ordStatus === 'Completed');
    const cancelledOrders = orders.filter(order => order.ordStatus === 'Cancelled');
    const ratedOrders = orders.filter(order => order.rating !== undefined);
    
    const totalSpent = completedOrders.reduce((total, order) => total + order.totalAmount, 0);
    const averageRating = ratedOrders.length > 0 
      ? ratedOrders.reduce((sum, order) => sum + (order.rating ?? 0), 0) / ratedOrders.length 
      : 0;

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalSpent,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    };
  } catch (error) {
    console.error('Error getting order statistics:', error);
    throw new Error('Failed to get order statistics');
  }
};