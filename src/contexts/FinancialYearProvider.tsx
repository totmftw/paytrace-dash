// src/contexts/FinancialYearProvider.tsx
import { createContext, useContext, useState, useMemo } from "react";
import { getFinancialYearDates } from "@/utils/financialYearUtils";

interface FinancialYearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  fyOptions: number[];
  getFYDates: () => { start: Date; end: Date };
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

export const FinancialYearContext = createContext<FinancialYearContextType | null>(null);

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.MONTH);

  const fyOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const getFYDates = () => getFinancialYearDates(selectedYear);

  return (
    <FinancialYearContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        fyOptions,
        getFYDates,
        timeFrame,
        setTimeFrame
      }}
    >
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