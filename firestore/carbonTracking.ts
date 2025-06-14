import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './firebase';

// Types and Interfaces
export interface CarbonTracking {
  ctNo: string;           // 碳足跡紀錄編號
  stoNo: string;          // 店家編號 (Foreign Key)
  trackDate: Date;        // 紀錄日期
  carbonRed: number;      // 減碳量 (kg CO2)
  redDesc?: string;       // 減碳行動描述
  verifyStatus: VerifyStatus; // 驗證狀態
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type VerifyStatus = 'Pending' | 'Verified';

export interface CreateCarbonTrackingData {
  stoNo: string;
  trackDate: Date;
  carbonRed: number;
  redDesc?: string;
  verifyStatus?: VerifyStatus;
}

export interface UpdateCarbonTrackingData {
  trackDate?: Date;
  carbonRed?: number;
  redDesc?: string;
  verifyStatus?: VerifyStatus;
}

// Collection reference
const carbonTrackingCollection = collection(db, 'carbonTracking');

// Utility functions
export const generateCTNo = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `CT${timestamp}`;
};

// CRUD Operations
export const createCarbonTracking = async (data: CreateCarbonTrackingData): Promise<string> => {
  try {
    const ctNo = generateCTNo();
    
    const carbonTrackingData: Omit<CarbonTracking, 'ctNo'> = {
      ...data,
      verifyStatus: data.verifyStatus || 'Pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(carbonTrackingCollection, {
      ctNo,
      ...carbonTrackingData,
    });

    // Update document with the generated ID
    await updateDoc(docRef, { ctNo });
    
    return ctNo;
  } catch (error) {
    console.error('Error creating carbon tracking:', error);
    throw new Error('Failed to create carbon tracking record');
  }
};

export const getCarbonTrackingById = async (ctNo: string): Promise<CarbonTracking | null> => {
  try {
    const q = query(carbonTrackingCollection, where('ctNo', '==', ctNo));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      trackDate: doc.data().trackDate.toDate(),
    } as CarbonTracking;
  } catch (error) {
    console.error('Error getting carbon tracking:', error);
    throw new Error('Failed to get carbon tracking record');
  }
};

export const getCarbonTrackingByStore = async (stoNo: string): Promise<CarbonTracking[]> => {
  try {
    const q = query(
      carbonTrackingCollection, 
      where('stoNo', '==', stoNo),
      orderBy('trackDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      trackDate: doc.data().trackDate.toDate(),
    })) as CarbonTracking[];
  } catch (error) {
    console.error('Error getting carbon tracking by store:', error);
    throw new Error('Failed to get carbon tracking records');
  }
};

export const getCarbonTrackingByDateRange = async (
  stoNo: string,
  startDate: Date,
  endDate: Date
): Promise<CarbonTracking[]> => {
  try {
    const q = query(
      carbonTrackingCollection,
      where('stoNo', '==', stoNo),
      where('trackDate', '>=', startDate),
      where('trackDate', '<=', endDate),
      orderBy('trackDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      trackDate: doc.data().trackDate.toDate(),
    })) as CarbonTracking[];
  } catch (error) {
    console.error('Error getting carbon tracking by date range:', error);
    throw new Error('Failed to get carbon tracking records');
  }
};

export const getPendingVerifications = async (): Promise<CarbonTracking[]> => {
  try {
    const q = query(
      carbonTrackingCollection,
      where('verifyStatus', '==', 'Pending'),
      orderBy('trackDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      trackDate: doc.data().trackDate.toDate(),
    })) as CarbonTracking[];
  } catch (error) {
    console.error('Error getting pending verifications:', error);
    throw new Error('Failed to get pending verification records');
  }
};

export const updateCarbonTracking = async (
  ctNo: string, 
  data: UpdateCarbonTrackingData
): Promise<void> => {
  try {
    const q = query(carbonTrackingCollection, where('ctNo', '==', ctNo));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Carbon tracking record not found');
    }
    
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating carbon tracking:', error);
    throw new Error('Failed to update carbon tracking record');
  }
};

export const verifyCarbonTracking = async (ctNo: string): Promise<void> => {
  try {
    await updateCarbonTracking(ctNo, { verifyStatus: 'Verified' });
  } catch (error) {
    console.error('Error verifying carbon tracking:', error);
    throw new Error('Failed to verify carbon tracking record');
  }
};

export const deleteCarbonTracking = async (ctNo: string): Promise<void> => {
  try {
    const q = query(carbonTrackingCollection, where('ctNo', '==', ctNo));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Carbon tracking record not found');
    }
    
    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting carbon tracking:', error);
    throw new Error('Failed to delete carbon tracking record');
  }
};

// Analytics functions
export const getTotalCarbonReduction = async (stoNo: string): Promise<number> => {
  try {
    const records = await getCarbonTrackingByStore(stoNo);
    const verifiedRecords = records.filter(record => record.verifyStatus === 'Verified');
    
    return verifiedRecords.reduce((total, record) => total + record.carbonRed, 0);
  } catch (error) {
    console.error('Error calculating total carbon reduction:', error);
    throw new Error('Failed to calculate total carbon reduction');
  }
};

export const getCarbonReductionByMonth = async (
  stoNo: string, 
  year: number, 
  month: number
): Promise<number> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const records = await getCarbonTrackingByDateRange(stoNo, startDate, endDate);
    const verifiedRecords = records.filter(record => record.verifyStatus === 'Verified');
    
    return verifiedRecords.reduce((total, record) => total + record.carbonRed, 0);
  } catch (error) {
    console.error('Error calculating monthly carbon reduction:', error);
    throw new Error('Failed to calculate monthly carbon reduction');
  }
};