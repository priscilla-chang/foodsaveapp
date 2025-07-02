// contexts/PointsContext.tsx
import { arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firestore/firebase';

// 型別定義
interface PointsContextType {
  points: number;
  setPoints: (points: number) => void;
  addHistory: (entry: string) => void;
  checkInToday: () => Promise<boolean>;
  history: string[];
  loading: boolean;
}

const PointsContext = createContext<PointsContextType>({
  points: 0,
  setPoints: () => {},
  addHistory: () => {},
  checkInToday: async () => false,
  history: [],
  loading: true,
});

export const usePoints = () => useContext(PointsContext);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  // 取得使用者點數
  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setLoading(false);
          return;
        }
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPoints(data.points ?? 0);
          setHistory(data.history ?? []);
          setLastCheckIn(data.lastCheckIn ?? null);
        }
      } catch (err) {
        console.error('Fetch points error:', err);
      }
      setLoading(false);
    };
    fetchPoints();
  }, [auth.currentUser?.uid]);

  // 新增紀錄
  const addHistory = (entry: string) => {
    setHistory(prev => [entry, ...prev]);
  };

  // 每日簽到
  const checkInToday = async (): Promise<boolean> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    const today = new Date().toISOString().slice(0, 10);

    // 已經簽到過就 return false
    if (lastCheckIn === today) return false;

    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      points: increment(1),
      history: arrayUnion(`每日簽到 +1 點 (${today})`),
      lastCheckIn: today,
    });

    setPoints(points + 1);
    setHistory(prev => [`每日簽到 +1 點 (${today})`, ...prev]);
    setLastCheckIn(today);
    return true;
  };

  return (
    <PointsContext.Provider
      value={{
        points,
        setPoints,
        addHistory,
        checkInToday,
        history,
        loading,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
};
