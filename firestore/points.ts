import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// ---------- Enums ----------
export type PointType = 'Order' | 'CheckIn' | 'Activity' | 'Bonus' | 'Referral';
export type GoalType = '省錢' | '減碳';
export type GoalStatus = 'Active' | 'Completed' | 'Failed' | 'Paused';

// ---------- Interfaces ----------
export interface MemberPoint {
  mPtNo: string;
  mbrId: string;
  ptsValue: number;
  ptsDate: Date;
  ptsType: PointType;
  ptsDesc?: string;
  expireTime?: Date;
  isUsed: boolean;
  usedDate?: Date;
  relatedOrderNo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatePointData {
  mbrId: string;
  ptsValue: number;
  ptsType: PointType;
  ptsDesc?: string;
  expireTime?: Date;
  relatedOrderNo?: string;
}

// ---------- Collection ----------
const memberPointCollection = collection(db, 'memberPoints');

// ---------- Utilities ----------
export const PointsUtils = {
  isExpired: (point: MemberPoint): boolean =>
    !!point.expireTime && point.expireTime < new Date(),

  calculateAvailablePoints: (points: MemberPoint[]): number =>
    points
      .filter(p => !PointsUtils.isExpired(p) && !p.isUsed)
      .reduce((sum, p) => sum + p.ptsValue, 0),

  formatPoints: (value: number): string => value.toLocaleString(),

  getPointsDescription: (type: PointType, desc?: string): string => {
    if (desc) return desc;
    switch (type) {
      case 'Order': return '訂單獎勵';
      case 'CheckIn': return '每日簽到';
      case 'Activity': return '活動參與';
      case 'Bonus': return '系統獎勵';
      case 'Referral': return '邀請獎勵';
      default: return '點數';
    }
  },

  generateMPtNo: (): string =>
    `MPt${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
};

// ---------- CRUD ----------
export const addMemberPoints = async (data: CreatePointData): Promise<string> => {
  try {
    const mPtNo = PointsUtils.generateMPtNo();
    const expireTime = data.expireTime ?? new Date(Date.now() + 365 * 86400000);

    const pointData: Omit<MemberPoint, 'mPtNo'> = {
      ...data,
      ptsDate: new Date(),
      expireTime,
      isUsed: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    await addDoc(memberPointCollection, {
      mPtNo,
      ...pointData
    });

    return mPtNo;
  } catch (error) {
    console.error('Error adding member points:', error);
    throw new Error('Failed to add member points');
  }
};

export const getMemberPoints = async (mbrId: string): Promise<MemberPoint[]> => {
  try {
    const q = query(
      memberPointCollection,
      where('mbrId', '==', mbrId),
      orderBy('ptsDate', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        ptsDate: data.ptsDate.toDate(),
        expireTime: data.expireTime?.toDate(),
        usedDate: data.usedDate?.toDate()
      };
    }) as MemberPoint[];
  } catch (error) {
    console.error('Error getting member points:', error);
    throw new Error('Failed to get member points');
  }
};

export const getAvailablePoints = async (mbrId: string): Promise<MemberPoint[]> => {
  const now = new Date();
  const points = await getMemberPoints(mbrId);
  return points.filter(p => !p.isUsed && (!p.expireTime || p.expireTime > now));
};

export const getTotalAvailablePoints = async (mbrId: string): Promise<number> => {
  const available = await getAvailablePoints(mbrId);
  return available.reduce((sum, p) => sum + p.ptsValue, 0);
};

export const usePoints = async (mbrId: string, pointsToUse: number): Promise<boolean> => {
  const available = await getAvailablePoints(mbrId);
  const total = available.reduce((sum, p) => sum + p.ptsValue, 0);

  if (total < pointsToUse) return false;

  const batch = writeBatch(db);
  let remaining = pointsToUse;

  const sortedPoints = available.toSorted?.(
    (a, b) => a.ptsDate.getTime() - b.ptsDate.getTime()
  ) ?? [...available].sort((a, b) => a.ptsDate.getTime() - b.ptsDate.getTime());

  for (const point of sortedPoints) {
    if (remaining <= 0) break;

    const deduct = Math.min(remaining, point.ptsValue);
    remaining -= deduct;

    const docRef = doc(db, 'memberPoints', point.mPtNo);
    batch.update(docRef, {
      isUsed: true,
      usedDate: new Date(),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  return true;
};
