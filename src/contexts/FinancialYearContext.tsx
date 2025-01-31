// src/contexts/FinancialYearContext.tsx
import { createContext, useContext, useState } from 'react';
import dayjs from 'dayjs';


// src/contexts/FinancialYearContext.tsx
export function FinancialYearProvider({ children }: React.PropsWithChildren) {
  const [selectedYear, setSelectedYear] = React.useState(() => {
    const now = dayjs();
    const year = now.month() >= 3 ? now.year() : now.year() - 1;
    return `${year}-${year + 1}`;
  });

  const handleChangeYear = async (newYear: string) => {
    // Save to Supabase if needed
    setSelectedYear(newYear);
  };

  return (
    <FinancialYearContext.Provider value={{ selectedYear, startDate, endDate, handleChangeYear }}>
      {children}
    </FinancialYearContext.Provider>
  );
}


interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  startDate: Date;
  endDate: Date;
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export function useFinancialYear() {
  const context = useContext(FinancialYearContext);
  if (!context) throw new Error('useFinancialYear must be used within FinancialYearContextProvider');
  return context;
}

export function FinancialYearProvider({ children }: React.PropsWithChildren) {
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = dayjs();
    const year = now.month() >= 3 ? now.year() : now.year() - 1;
    return `${year}-${year + 1}`;
  });

  const startDate = dayjs(`${selectedYear.split('-')[0]}-04-01`).toDate();
  const endDate = dayjs(`${selectedYear.split('-')[1]}-03-31`).toDate();

  return (
    <FinancialYearContext.Provider value={{ selectedYear, startDate, endDate, setSelectedYear }}>
      {children}
    </FinancialYearContext.Provider>
  );
}