import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PointsContextProps {
  points: number;
  setPoints: (val: number) => void;
  history: string[];
  addHistory: (entry: string) => void;
}
const PointsContext = createContext<PointsContextProps | undefined>(undefined);

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(2000);
  const [history, setHistory] = useState<string[]>([]);

  const addHistory = (entry: string) => {
    setHistory(prev => [entry, ...prev]);
  };

  return (
    <PointsContext.Provider value={{ points, setPoints, history, addHistory }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};
