import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFYDates: () => { start: Date; end: Date };
  isLoading: boolean;
  fyOptions: string[];
  isTransitioning: boolean;
}

const FinancialYearContext = createContext<FinancialYearContextType>({
  selectedYear: '',
  setSelectedYear: () => {},
  getFYDates: () => ({ start: new Date(), end: new Date() }),
  isLoading: true,
  fyOptions: [],
  isTransitioning: false
});

export const FinancialYearProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fyOptions, setFyOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchFYOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('financial_year_ranges')
          .select('*')
          .order('financial_year', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setFyOptions(data.map(fy => fy.financial_year));
          setSelectedYear(data[0].financial_year);
        }
      } catch (error) {
        console.error('Error fetching financial years:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFYOptions();
  }, []);

  const handleYearChange = (year: string) => {
    if (!fyOptions.includes(year) || isTransitioning) return;
    setIsTransitioning(true);
    setSelectedYear(year);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const getFYDates = () => {
    const [startYear] = selectedYear.split('-').map(Number);
    return {
      start: new Date(startYear, 3, 1), // April 1st
      end: new Date(startYear + 1, 2, 31) // March 31st
    };
  };

  return (
    <FinancialYearContext.Provider 
      value={{ 
        selectedYear, 
        setSelectedYear: handleYearChange, 
        getFYDates, 
        isLoading,
        fyOptions,
        isTransitioning
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