import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Context 內容型別
type AuthProviderProps = {
  readonly children: ReactNode;
};
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// 創建 Context（預設 user:null, loading:true）
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// 提供全域登入狀態的 Provider 組件
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 監聽 Firebase Auth 狀態（登入/登出都會 callback）
    const unsubscribe = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe; // 離開元件自動移除監聽
  }, []);

  // 避免重複創建物件
  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 提供給組件使用的 hook：取得 user 狀態
export function useAuth() {
  return useContext(AuthContext);
}
