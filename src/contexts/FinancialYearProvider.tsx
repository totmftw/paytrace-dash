import React, { createContext, useState, useMemo } from 'react';

interface FinancialYearContextType {
  currentFY: string;
  setCurrentFY: (fy: string) => void;
}

export const FinancialYearContext = createContext<FinancialYearContextType>({
  currentFY: '',
  setCurrentFY: () => {},
});

export function FinancialYearProvider({ children }: { children: React.ReactNode }) {
  const [currentFY, setCurrentFY] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JavaScript months are 0-based
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  });

  const value = useMemo(() => ({
    currentFY,
    setCurrentFY,
  }), [currentFY]);

  return (
    <FinancialYearContext.Provider value={value}>
      {children}
    </FinancialYearContext.Provider>
  );
}