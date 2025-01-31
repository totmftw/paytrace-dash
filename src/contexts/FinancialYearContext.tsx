import { createContext, useContext, useState } from "react";

export interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFYDates: () => { start: Date; end: Date };
}

export const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export function useFinancialYear() {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error("useFinancialYear must be used within a FinancialYearProvider");
  }
  return context;
}

export function FinancialYearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    return currentMonth >= 4 
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;
  });

  const getFYDates = () => {
    const [startYear] = selectedYear.split('-');
    const start = new Date(parseInt(startYear), 3, 1); // April 1st
    const end = new Date(parseInt(startYear) + 1, 2, 31); // March 31st
    return { start, end };
  };

  const value = {
    selectedYear,
    setSelectedYear,
    getFYDates
  };

  return (
    <FinancialYearContext.Provider value={value}>
      {children}
    </FinancialYearContext.Provider>
  );
}