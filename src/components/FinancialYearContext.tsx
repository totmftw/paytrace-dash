// FinancialYearContext.tsx
import { createContext, useContext, useState } from "react";

interface FinancialYearContextType {
  selectedYear: number | null;
  setSelectedYear: (year: number) => void;
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear }}>
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