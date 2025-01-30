import { createContext, useContext, useState } from "react";
import { getFinancialYearDates } from "@/utils/financialYearUtils";

export type TimeFrame = 'week' | 'month' | 'quarter';

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  fyOptions: string[];
  getFYDates: () => { start: Date; end: Date };
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

export const FinancialYearContext = createContext<FinancialYearContextType | null>(null);

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');

  const fyOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
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