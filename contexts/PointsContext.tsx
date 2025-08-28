import { arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { auth, db } from '../firestore/firebase';

// 型別定義
interface PointsContextType {
  points: number;
  setPoints: (points: number) => void;
  addHistory: (entry: string) => void;
  checkInToday: () => Promise<boolean>;
  adjustPoints: (uid: string, delta: number, reason?: string) => Promise<void>;
  history: string[];
  loading: boolean;
}

const PointsContext = createContext<PointsContextType>({
  points: 0,
  setPoints: () => {},
  addHistory: () => {},
  checkInToday: async () => false,
  adjustPoints: async () => {},
  history: [],
  loading: true,
});

export const usePoints = () => useContext(PointsContext);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);

  // 取得使用者點數（掛載時跑一次）
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
          setPoints(Math.max(0, data.points ?? 0)); // ✅ 防止負數
          setHistory(data.history ?? []);
          setLastCheckIn(data.lastCheckIn ?? null);
        }
      } catch (err) {
        console.error('Fetch points error:', err);
      }
      setLoading(false);
    };
    fetchPoints();
  }, []); // ✅ 空依賴，不會觸發 ESLint 警告

  // 新增紀錄（本地）
  const addHistory = (entry: string) => {
    setHistory(prev => [entry, ...prev]);
  };

  // 每日簽到（用 useCallback 包裝，避免 ESLint 警告）
  const checkInToday = useCallback(async (): Promise<boolean> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    const today = new Date().toISOString().slice(0, 10);

    if (lastCheckIn === today) return false;

    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      points: increment(1),
      history: arrayUnion(`每日簽到 +1 點 (${today})`),
      lastCheckIn: today,
    });

    // 重新讀取 Firestore 最新值
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setPoints(Math.max(0, data.points ?? 0));
      setHistory(data.history ?? []);
      setLastCheckIn(today);
    }
    return true;
  }, [lastCheckIn]);

  // 後台工具：手動調整點數（用 useCallback 包裝）
  const adjustPoints = useCallback(
    async (uid: string, delta: number, reason = '系統調整') => {
      try {
        const ref = doc(db, 'users', uid);
        await updateDoc(ref, {
          points: increment(delta),
          history: arrayUnion(
            `${reason} ${delta > 0 ? '+' : ''}${delta} 點 (${new Date().toLocaleString()})`
          ),
        });

        // 如果調整的是目前登入的 user，也要同步更新 context
        if (uid === auth.currentUser?.uid) {
          setPoints(p => Math.max(0, p + delta));
          setHistory(prev => [
            `${reason} ${delta > 0 ? '+' : ''}${delta} 點 (${new Date().toLocaleString()})`,
            ...prev,
          ]);
        }
      } catch (err) {
        console.error('❌ adjustPoints error:', err);
      }
    },
    []
  );

  // ✅ 用 useMemo，避免每 render 都建立新物件
  const contextValue = useMemo(
    () => ({
      points,
      setPoints: (val: number) => setPoints(Math.max(0, val)), // 強制不小於 0
      addHistory,
      checkInToday,
      adjustPoints,
      history,
      loading,
    }),
    [points, history, loading, checkInToday, adjustPoints]
  );

  return (
    <PointsContext.Provider value={contextValue}>
      {children}
    </PointsContext.Provider>
  );
};
