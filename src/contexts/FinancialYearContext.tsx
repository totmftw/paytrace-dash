import { createContext, useContext, useState } from "react";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFYDates: () => { start: Date; end: Date };
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const getFYDates = () => {
    const [startYear, endYear] = selectedYear.split('-').map(Number);
    return {
      start: new Date(`${startYear}-04-01`),
      end: new Date(`${endYear}-03-31`)
    };
  };

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, getFYDates }}>
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