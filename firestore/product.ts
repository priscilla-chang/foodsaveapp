import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// 類型定義
export type ProductCategory =
  | '便當' | '麵食' | '飯類' | '燒烤' | '火鍋' | '湯類'
  | '中式料理' | '西式料理' | '日式料理' | '韓式料理' | '東南亞料理'
  | '蔬果' | '肉類' | '海鮮' | '冷凍食品' | '零食' | '飲料' | '乳製品' | '調味料' | '泡麵' | '米'
  | '麵包' | '三明治' | '甜點' | '蛋糕' | '烘焙點心' | '巧克力' | '咖啡' | '茶' | '輕食' | '貝果'
  | '熟食' | '醬料' | '半成品料理' | '即食品' | '手搖飲' | '果汁' | '冰沙';

export type ProductStatus = 'Available' | 'Sold' | 'Expired' | 'Hidden';

export interface Product {
  prodNo: string;
  stoNo: string;
  prodName: string;
  prodDesc: string;
  prodCat: ProductCategory;
  origPrice: number;
  prodPrice: number;
  expDate: Date;
  qtyAvail: number;
  carbonFtpt: number;
  prodStatus: ProductStatus;
  createTime: Date;
  prodPic?: string;
  updatedAt?: Date;
}

export interface CreateProductData {
  stoNo: string;
  prodName: string;
  prodDesc: string;
  prodCat: ProductCategory;
  origPrice: number;
  prodPrice: number;
  expDate: Date;
  qtyAvail: number;
  carbonFtpt: number;
  prodPic?: string;
}

export interface UpdateProductData {
  prodName?: string;
  prodDesc?: string;
  prodCat?: ProductCategory;
  origPrice?: number;
  prodPrice?: number;
  expDate?: Date;
  qtyAvail?: number;
  carbonFtpt?: number;
  prodStatus?: ProductStatus;
  prodPic?: string;
}

// 驗證
export const validateProductData = (data: CreateProductData): string[] => {
  const errors: string[] = [];
  if (!data.prodName) errors.push('商品名稱為必填項目');
  if (!data.stoNo?.startsWith('S')) errors.push('店家編號格式不正確');
  if (data.origPrice <= 0) errors.push('商品原價必須大於0');
  if (data.prodPrice <= 0) errors.push('商品特價必須大於0');
  if (data.prodPrice > data.origPrice) errors.push('特價不能高於原價');
  if (!data.expDate || data.expDate < new Date()) errors.push('到期日期必須為今天或之後');
  if (data.qtyAvail < 0) errors.push('可預約數量不能小於0');
  if (data.carbonFtpt < 0) errors.push('碳足跡不能小於0');

  const validCategories: ProductCategory[] = [
    '便當', '麵食', '飯類', '燒烤', '火鍋', '湯類',
    '中式料理', '西式料理', '日式料理', '韓式料理', '東南亞料理',
    '蔬果', '肉類', '海鮮', '冷凍食品', '零食', '飲料', '乳製品', '調味料', '泡麵', '米',
    '麵包', '三明治', '甜點', '蛋糕', '烘焙點心', '巧克力', '咖啡', '茶', '輕食', '貝果',
    '熟食', '醬料', '半成品料理', '即食品', '手搖飲', '果汁', '冰沙'
  ];

  if (!validCategories.includes(data.prodCat)) {
    errors.push('商品類別不正確');
  }

  return errors;
};

// 集合參考
export const productsCollection = collection(db, 'products');

// 建立商品
export const createProduct = async (productData: CreateProductData): Promise<string> => {
  const errors = validateProductData(productData);
  if (errors.length > 0) throw new Error(errors.join(', '));

  const newProduct: Omit<Product, 'prodNo'> = {
    ...productData,
    prodStatus: 'Available',
    createTime: new Date(),
    updatedAt: new Date()
  };

  const docRef = await addDoc(productsCollection, {
    ...newProduct,
    expDate: Timestamp.fromDate(newProduct.expDate),
    createTime: Timestamp.fromDate(newProduct.createTime),
    updatedAt: Timestamp.fromDate(newProduct.updatedAt!)
  });

  await updateDoc(docRef, { prodNo: `P${docRef.id.slice(-8)}` });
  return docRef.id;
};

// 查詢單一商品
export const getProductById = async (productId: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      expDate: data.expDate.toDate(),
      createTime: data.createTime.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Product;
  }
  return null;
};

// 更新商品
export const updateProduct = async (productId: string, updateData: UpdateProductData): Promise<void> => {
  const docRef = doc(db, 'products', productId);
  const updatePayload: any = {
    ...updateData,
    updatedAt: Timestamp.fromDate(new Date())
  };
  if (updateData.expDate) {
    updatePayload.expDate = Timestamp.fromDate(updateData.expDate);
  }
  await updateDoc(docRef, updatePayload);
};

// 刪除商品
export const deleteProduct = async (productId: string): Promise<void> => {
  const docRef = doc(db, 'products', productId);
  await deleteDoc(docRef);
};

// 查詢某店商品
export const getProductsByStore = async (storeId: string): Promise<Product[]> => {
  const q = query(productsCollection, where('stoNo', '==', storeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      expDate: data.expDate.toDate(),
      createTime: data.createTime.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Product;
  });
};

// 查詢可用商品
export const getAvailableProducts = async (limitCount?: number): Promise<Product[]> => {
  let q = query(
    productsCollection,
    where('prodStatus', '==', 'Available'),
    where('qtyAvail', '>', 0),
    orderBy('createTime', 'desc')
  );
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      expDate: data.expDate.toDate(),
      createTime: data.createTime.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Product;
  });
};

// 查詢分類商品
export const getProductsByCategory = async (category: ProductCategory): Promise<Product[]> => {
  const q = query(
    productsCollection,
    where('prodCat', '==', category),
    where('prodStatus', '==', 'Available'),
    where('qtyAvail', '>', 0)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      expDate: data.expDate.toDate(),
      createTime: data.createTime.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Product;
  });
};
