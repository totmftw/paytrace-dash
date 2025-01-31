import React, { createContext, useContext, useState } from 'react';

export interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFYDates: () => { start: Date; end: Date };
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export function useFinancialYear() {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return context;
}

export function FinancialYearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return currentMonth >= 4 
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;
  });

  const getFYDates = () => {
    const [startYear] = selectedYear.split('-').map(Number);
    const start = new Date(startYear, 3, 1); // April 1st
    const end = new Date(startYear + 1, 2, 31); // March 31st next year
    return { start, end };
  };

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, getFYDates }}>
      {children}
    </FinancialYearContext.Provider>
  );
}