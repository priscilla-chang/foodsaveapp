import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  productId: string;   // Firestore product id
  id: string;          // local key
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, newQty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ✅ 初始化時從 AsyncStorage 載入
  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await AsyncStorage.getItem('cart');
        if (data) setCartItems(JSON.parse(data));
      } catch (err) {
        console.error('載入購物車失敗:', err);
      }
    };
    loadCart();
  }, []);

  // ✅ 每次更新存回 AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p))
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // ⚡️ 避免每次 render 重新建立物件
  const value = useMemo(
    () => ({ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart 必須在 CartProvider 內使用');
  return ctx;
};
