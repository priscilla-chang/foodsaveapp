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

// Member types and interfaces
export type MemberRole = 'Consumer' | 'Store';
export type MemberStatus = 'Active' | 'Inactive' | 'Banned';
export type AllergenType = '花生' | '堅果' | '乳製品' | '蛋' | '大豆' | '小麥' | '麩質' | '海鮮' | '玉米' | '芝麻';
export type PreferenceType = '全素' | '蛋素' | '奶素' | '蛋奶素' | '植物五辛' | '低醣' | '低脂' | '高蛋白' | '無麩質' | '無乳製品';

export interface Member {
  mbrID: string;
  mbrName: string;
  mbrAdd: string;
  mbrTelNo: string;
  mbrEmail: string;
  mbrPwd: string;
  joinDate: Date;
  mbrDOB: Date;
  mbrRole: MemberRole;
  mbrStatus: MemberStatus;
  lastLoginTime?: Date;
  allergens: AllergenType[];
  preferences: PreferenceType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMemberData {
  mbrName: string;
  mbrAdd: string;
  mbrTelNo: string;
  mbrEmail: string;
  mbrPwd: string;
  mbrDOB: Date;
  mbrRole: MemberRole;
  allergens?: AllergenType[];
  preferences?: PreferenceType[];
}

export interface UpdateMemberData {
  mbrName?: string;
  mbrAdd?: string;
  mbrTelNo?: string;
  mbrEmail?: string;
  mbrPwd?: string;
  mbrDOB?: Date;
  mbrStatus?: MemberStatus;
  allergens?: AllergenType[];
  preferences?: PreferenceType[];
}

// Validation functions
export const validateMemberData = (data: CreateMemberData): string[] => {
  const errors: string[] = [];
  
  if (!data.mbrName || data.mbrName.length === 0) {
    errors.push('會員姓名為必填項目');
  }
  
  if (!data.mbrTelNo || !/^\d{10}$/.test(data.mbrTelNo)) {
    errors.push('手機號碼必須為10位數字');
  }
  
  if (!data.mbrEmail || !data.mbrEmail.includes('@') || !data.mbrEmail.includes('.com')) {
    errors.push('電子郵件格式不正確');
  }
  
  if (!data.mbrPwd || data.mbrPwd.length < 8) {
    errors.push('密碼長度至少8個字元');
  }
  
  if (data.mbrDOB && data.mbrDOB >= new Date()) {
    errors.push('生日必須早於今天');
  }
  
  return errors;
};

// Firestore collection reference
export const membersCollection = collection(db, 'members');

// CRUD operations
export const createMember = async (memberData: CreateMemberData): Promise<string> => {
  try {
    const errors = validateMemberData(memberData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const newMember: Omit<Member, 'mbrID'> = {
      ...memberData,
      joinDate: new Date(),
      mbrStatus: 'Active',
      allergens: memberData.allergens || [],
      preferences: memberData.preferences || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(membersCollection, {
      ...newMember,
      joinDate: Timestamp.fromDate(newMember.joinDate),
      mbrDOB: Timestamp.fromDate(newMember.mbrDOB),
      createdAt: Timestamp.fromDate(newMember.createdAt!),
      updatedAt: Timestamp.fromDate(newMember.updatedAt!)
    });

    // Update document with the generated ID as mbrID
    await updateDoc(docRef, { mbrID: `M${docRef.id.slice(-8)}` });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
};

export const getMemberById = async (memberId: string): Promise<Member | null> => {
  try {
    const docRef = doc(db, 'members', memberId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        joinDate: data.joinDate.toDate(),
        mbrDOB: data.mbrDOB.toDate(),
        lastLoginTime: data.lastLoginTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Member;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting member:', error);
    throw error;
  }
};

export const getMemberByEmail = async (email: string): Promise<Member | null> => {
  try {
    const q = query(membersCollection, where('mbrEmail', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        joinDate: data.joinDate.toDate(),
        mbrDOB: data.mbrDOB.toDate(),
        lastLoginTime: data.lastLoginTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Member;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting member by email:', error);
    throw error;
  }
};

export const updateMember = async (memberId: string, updateData: UpdateMemberData): Promise<void> => {
  try {
    const docRef = doc(db, 'members', memberId);
    const updatePayload: any = {
      ...updateData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (updateData.mbrDOB) {
      updatePayload.mbrDOB = Timestamp.fromDate(updateData.mbrDOB);
    }

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

export const updateLastLoginTime = async (memberId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'members', memberId);
    await updateDoc(docRef, {
      lastLoginTime: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating last login time:', error);
    throw error;
  }
};

export const deleteMember = async (memberId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'members', memberId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const querySnapshot = await getDocs(membersCollection);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        joinDate: data.joinDate.toDate(),
        mbrDOB: data.mbrDOB.toDate(),
        lastLoginTime: data.lastLoginTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Member;
    });
  } catch (error) {
    console.error('Error getting all members:', error);
    throw error;
  }
};

export const getMembersByRole = async (role: MemberRole): Promise<Member[]> => {
  try {
    const q = query(membersCollection, where('mbrRole', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        joinDate: data.joinDate.toDate(),
        mbrDOB: data.mbrDOB.toDate(),
        lastLoginTime: data.lastLoginTime?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Member;
    });
  } catch (error) {
    console.error('Error getting members by role:', error);
    throw error;
  }
};