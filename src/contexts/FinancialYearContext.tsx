import { createContext, useContext, useState } from "react";
import dayjs from "dayjs";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  startDate: Date;
  endDate: Date;
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export function useFinancialYear() {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error("useFinancialYear must be used within a FinancialYearProvider");
  }
  return context;
}

export function FinancialYearProvider({ children }: React.PropsWithChildren) {
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = dayjs();
    const year = now.month() >= 3 ? now.year() : now.year() - 1;
    return `${year}-${year + 1}`;
  });

  const [startYear, endYear] = selectedYear.split('-').map(Number);
  const startDate = dayjs(`${startYear}-04-01`).toDate();
  const endDate = dayjs(`${endYear}-03-31`).toDate();

  return (
    <FinancialYearContext.Provider 
      value={{ 
        selectedYear, 
        setSelectedYear,
        startDate,
        endDate
      }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
}