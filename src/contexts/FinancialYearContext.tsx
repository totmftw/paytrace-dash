import { createContext, useContext, useState } from "react";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
}

export const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export function FinancialYearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears] = useState<string[]>([
    (new Date().getFullYear() - 1).toString(),
    new Date().getFullYear().toString(),
    (new Date().getFullYear() + 1).toString(),
  ]);

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </FinancialYearContext.Provider>
  );
}

export function useFinancialYear() {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error("useFinancialYear must be used within a FinancialYearProvider");
  }
  return context;
}