import { createContext, useContext, useState, FC } from "react";
import dayjs from "dayjs";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  startDate: Date;
  endDate: Date;
}

export const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const now = dayjs();
    const year = now.month() >= 3 ? now.year() : now.year() - 1;
    return `${year}-${year + 1}`;
  });

  const startDate = dayjs(`${selectedYear.split('-')[0]}-04-01`).toDate();
  const endDate = dayjs(`${selectedYear.split('-')[1]}-03-31`).toDate();

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, startDate, endDate }}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error("useFinancialYear must be used within a FinancialYearProvider");
  }
  return context;
};