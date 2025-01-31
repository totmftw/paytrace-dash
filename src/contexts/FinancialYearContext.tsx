// src/context/FinancialYearContext.tsx
import { createContext, useContext, useState } from 'react';
// src/contexts/FinancialYearContext.tsx
// (Keep existing implementation but update imports to match correct paths)
import { createContext, useContext, useState } from 'react';

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFinancialYearDates: () => { startDate: Date; endDate: Date };
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return currentMonth >= 3 ? currentYear.toString() : (currentYear - 1).toString();
  });

  const getFinancialYearDates = () => {
    const startDate = new Date(`${selectedYear}-04-01`);
    const endDate = new Date(`${parseInt(selectedYear) + 1}-03-31`);
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
  if (!context) throw new Error('useFinancialYear must be used within FinancialYearProvider');
  return context;
};
