import React, { createContext, useContext, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface FinancialYearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  getFYDates: () => { start: Date; end: Date };
}

export const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export function useFinancialYear() {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return context;
}

export function FinancialYearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getFYDates = () => {
    const start = new Date(selectedYear, 3, 1); // April 1st
    const end = new Date(selectedYear + 1, 2, 31); // March 31st
    return { start, end };
  };

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, getFYDates }}>
      {children}
    </FinancialYearContext.Provider>
  );
}