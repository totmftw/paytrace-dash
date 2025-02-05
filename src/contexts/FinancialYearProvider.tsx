import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFinancialYear } from "@/utils/financialYearUtils";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
}

const FinancialYearContext = createContext<FinancialYearContextType>({
  selectedYear: getCurrentFinancialYear(),
  setSelectedYear: () => {},
  availableYears: [],
});

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentFinancialYear());
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data, error } = await supabase.from("financial_year_ranges").select("financial_year");
        if (error) throw error;
        setAvailableYears(data.map(year => year.financial_year));
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };

    fetchYears();
  }, []);

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = (): FinancialYearContextType => {
  const context = useContext(FinancialYearContext);
  if (!context) throw new Error("useFinancialYear must be used within FinancialYearProvider");
  return context;
};