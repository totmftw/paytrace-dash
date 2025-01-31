// src/contexts/FinancialYearContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFinancialYearDates: () => { startDate: Date; endDate: Date };
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return currentMonth >= 3 ? currentYear.toString() : (currentYear - 1).toString();
  });

  const getFinancialYearDates = () => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 3, 1);
    const endDate = new Date(year + 1, 2, 31);
    return { startDate, endDate };
  };

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, getFinancialYearDates }}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within FinancialYearProvider');
  }
  return context;
};
