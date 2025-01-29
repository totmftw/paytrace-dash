// src/contexts/FinancialYearContext.tsx
import { createContext, useContext, useState } from "react";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFYDates: () => { start: Date; end: Date };
}

const FinancialYearContext = createContext<FinancialYearContextType>({
  selectedYear: '',
  setSelectedYear: () => {},
  getFYDates: () => ({ start: new Date(), end: new Date() })
});

export const FinancialYearProvider = ({ children }: { children: React.ReactNode }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(`${currentYear}-${currentYear + 1}`);
  
  const getFYDates = () => {
    const [startYear] = selectedYear.split('-').map(Number);
    return {
      start: new Date(startYear, 3, 1), // April 1
      end: new Date(startYear + 1, 2, 31) // March 31 next year
    };
  };

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, getFYDates }}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => useContext(FinancialYearContext);