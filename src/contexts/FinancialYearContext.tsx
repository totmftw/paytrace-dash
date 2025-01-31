// src/contexts/FinancialYearContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider = ({ children }: { children: ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    // If current month is January to March, use previous year
    return (currentMonth < 3 ? currentYear - 1 : currentYear).toString();
  });

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (context === undefined) {
    throw new Error('useFinancialYear must be used within FinancialYearProvider');
  }
  return context;
};
