import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
  loading: boolean;
}

const FinancialYearContext = createContext<FinancialYearContextType>({
  selectedYear: '',
  setSelectedYear: () => {},
  availableYears: [],
  loading: true,
});

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    return month >= 4 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
  });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const { data, error } = await supabase
          .from("financial_year_ranges")
          .select("financial_year")
          .order("financial_year", { ascending: true });

        if (error) throw error;

        if (data) {
          setAvailableYears(data.map((year) => year.financial_year || ''));
        }
      } catch (error) {
        console.error("Error fetching financial years:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableYears();
  }, []);

  return (
    <FinancialYearContext.Provider value={{ selectedYear, setSelectedYear, availableYears, loading }}>
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