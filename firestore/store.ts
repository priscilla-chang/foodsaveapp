import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// Store types and interfaces
export type StoreType = '餐廳' | '超市' | '麵包店' | '蛋糕店' | '咖啡廳' | '便利商店' | '食品工廠' | '飲料店';
export type StoreStatus = 'Open' | 'Closed';

export interface Store {
  stoNo: string;
  mbrID: string;
  stoName: string;
  stoAdd: string;
  stoTelNo: string;
  stoType: StoreType;
  stoStatus: StoreStatus;
  storePic?: string;
  lastUpdateTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateStoreData {
  mbrID: string;
  stoName: string;
  stoAdd: string;
  stoTelNo: string;
  stoType: StoreType;
  storePic?: string;
}

export interface UpdateStoreData {
  stoName?: string;
  stoAdd?: string;
  stoTelNo?: string;
  stoType?: StoreType;
  stoStatus?: StoreStatus;
  storePic?: string;
}

// Validation functions
export const validateStoreData = (data: CreateStoreData): string[] => {
  const errors: string[] = [];
  
  if (!data.stoName || data.stoName.length === 0) {
    errors.push('店家名稱為必填項目');
  }
  
  if (!data.stoAdd || data.stoAdd.length === 0) {
    errors.push('店家地址為必填項目');
  }
  
  if (!data.stoTelNo || !/^\d{10}$/.test(data.stoTelNo)) {
    errors.push('店家電話必須為10位數字');
  }
  
  if (!data.mbrID?.startsWith('M')) {
    errors.push('會員編號格式不正確');
  }
  
  const validStoreTypes: StoreType[] = ['餐廳', '超市', '麵包店', '蛋糕店', '咖啡廳', '便利商店', '食品工廠', '飲料店'];
  if (!validStoreTypes.includes(data.stoType)) {
    errors.push('店家類型不正確');
  }
  
  return errors;
};

// Firestore collection reference
export const storesCollection = collection(db, 'stores');

// CRUD operations
export const createStore = async (storeData: CreateStoreData): Promise<string> => {
  try {
    const errors = validateStoreData(storeData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const newStore: Omit<Store, 'stoNo'> = {
      ...storeData,
      stoStatus: 'Open',
      lastUpdateTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(storesCollection, {
      ...newStore,
      lastUpdateTime: Timestamp.fromDate(newStore.lastUpdateTime!),
      createdAt: Timestamp.fromDate(newStore.createdAt!),
      updatedAt: Timestamp.fromDate(newStore.updatedAt!)
    });

    // Update document with the generated ID as stoNo
    await updateDoc(docRef, { stoNo: `S${docRef.id.slice(-8)}` });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

export const getStoreById = async (storeId: string): Promise<Store | null> => {
  try {
    const docRef = doc(db, 'stores', storeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastUpdateTime: data.lastUpdateTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Store;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting store:', error);
    throw error;
  }
};

export const getStoreByMemberId = async (memberId: string): Promise<Store | null> => {
  try {
    const q = query(storesCollection, where('mbrID', '==', memberId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        lastUpdateTime: data.lastUpdateTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Store;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting store by member ID:', error);
    throw error;
  }
};

export const updateStore = async (storeId: string, updateData: UpdateStoreData): Promise<void> => {
  try {
    const docRef = doc(db, 'stores', storeId);
    const updatePayload: any = {
      ...updateData,
      lastUpdateTime: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

export const deleteStore = async (storeId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'stores', storeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

export const getAllStores = async (): Promise<Store[]> => {
  try {
    const querySnapshot = await getDocs(storesCollection);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastUpdateTime: data.lastUpdateTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Store;
    });
  } catch (error) {
    console.error('Error getting all stores:', error);
    throw error;
  }
};

export const getStoresByType = async (storeType: StoreType): Promise<Store[]> => {
  try {
    const q = query(storesCollection, where('stoType', '==', storeType));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastUpdateTime: data.lastUpdateTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Store;
    });
  } catch (error) {
    console.error('Error getting stores by type:', error);
    throw error;
  }
};

export const getStoresByStatus = async (status: StoreStatus): Promise<Store[]> => {
  try {
    const q = query(storesCollection, where('stoStatus', '==', status));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastUpdateTime: data.lastUpdateTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Store;
    });
  } catch (error) {
    console.error('Error getting stores by status:', error);
    throw error;
  }
};

export const getOpenStores = async (): Promise<Store[]> => {
  return getStoresByStatus('Open');
};

export const searchStoresByName = async (searchTerm: string): Promise<Store[]> => {
  try {
    const querySnapshot = await getDocs(storesCollection);
    const allStores = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastUpdateTime: data.lastUpdateTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Store;
    });
    
    // Filter stores that contain the search term (case insensitive)
    return allStores.filter(store => 
      store.stoName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching stores by name:', error);
    throw error;
  }
};

export const toggleStoreStatus = async (storeId: string): Promise<void> => {
  try {
    const store = await getStoreById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }
    
    const newStatus: StoreStatus = store.stoStatus === 'Open' ? 'Closed' : 'Open';
    await updateStore(storeId, { stoStatus: newStatus });
  } catch (error) {
    console.error('Error toggling store status:', error);
    throw error;
  }
};