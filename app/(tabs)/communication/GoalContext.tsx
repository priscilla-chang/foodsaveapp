import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type GoalItem = {
  text: string;
  completed: boolean;
};

type GoalContextType = {
  goals: GoalItem[];
  addGoal: (goal: string) => void;
  toggleGoal: (index: number) => void;
  clearGoals: () => void;
};

const GoalContext = createContext<GoalContextType>({
  goals: [],
  addGoal: () => {},
  toggleGoal: () => {},
  clearGoals: () => {},
});

export const useGoals = () => useContext(GoalContext);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<GoalItem[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const stored = await AsyncStorage.getItem('userGoals');
        if (stored) {
          setGoals(JSON.parse(stored));
        }
      } catch (error) {
        console.error('讀取目標失敗:', error);
      }
    };
    loadGoals();
  }, []);

  const syncToStorage = async (updatedGoals: GoalItem[]) => {
    try {
      await AsyncStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('儲存目標失敗:', error);
    }
  };

  const addGoal = useCallback((text: string) => {
    const newGoal = { text, completed: false };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    syncToStorage(updated);
  }, [goals]);

  const toggleGoal = useCallback((index: number) => {
    const updated = goals.map((goal, i) =>
      i === index ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(updated);
    syncToStorage(updated);
  }, [goals]);

  const clearGoals = useCallback(() => {
    setGoals([]);
    AsyncStorage.removeItem('userGoals');
  }, []);

  const value = useMemo(
    () => ({ goals, addGoal, toggleGoal, clearGoals }),
    [goals, addGoal, toggleGoal, clearGoals]
  );

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
};

export default GoalProvider;
