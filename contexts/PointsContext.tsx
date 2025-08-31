// contexts/PointsContext.tsx
import { isSameDay, startOfDay } from 'date-fns';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type PointsContextType = {
  points: number;
  setPoints: (n: number) => void;
  history: string[];
  addHistory: (entry: string) => void;
  checkInToday: () => Promise<boolean>;
  carbonEmission: number;
  loading: boolean;
};

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [carbonEmission, setCarbonEmission] = useState(0);
  const [loading, setLoading] = useState(false);

  const addHistory = useCallback((entry: string) => {
    setHistory((prev) => [...prev, entry]);
  }, []);

  const checkInToday = useCallback(async (): Promise<boolean> => {
    const today = startOfDay(new Date());

    // 如果今天已簽到
    if (lastCheckIn && isSameDay(today, lastCheckIn)) {
      return false;
    }

    // 簽到成功
    setLastCheckIn(today);
    setPoints((prev) => prev + 100);
    addHistory(`[${new Date().toLocaleString()}] 每日簽到 +100 點`);
    return true;
  }, [lastCheckIn, addHistory]);

  // 模擬碳排放數據更新（你可改成從 API 拿資料）
  const simulateCarbon = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setCarbonEmission(Math.random() * 10); // 隨機一個數字
      setLoading(false);
    }, 500);
  }, []);

  // 初始模擬一次
  React.useEffect(() => {
    simulateCarbon();
  }, [simulateCarbon]);

  const value = useMemo(
    () => ({
      points,
      setPoints,
      history,
      addHistory,
      checkInToday,
      carbonEmission,
      loading,
    }),
    [points, history, addHistory, checkInToday, carbonEmission, loading]
  );

  return (
    <PointsContext.Provider value={value}>{children}</PointsContext.Provider>
  );
};

export const usePoints = () => {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints 必須在 PointsProvider 中使用');
  return ctx;
};