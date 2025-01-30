import { createContext, useContext, useState, useEffect } from "react";
import { addYears, subYears, startOfYear, endOfYear } from "date-fns";
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
  isLoading: false,
  fyOptions: [],
  isTransitioning: false
});

const getCurrentFY = () => {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1}`;
};

export const FinancialYearProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState(getCurrentFY());
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fyOptions, setFyOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchFYOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('invoiceTable')
          .select('invDate')
          .order('invDate');

        if (error) throw error;

        if (data && data.length > 0) {
          const years = new Set(
            data.map(invoice => {
              const date = new Date(invoice.invDate);
              return date.getMonth() >= 3 
                ? `${date.getFullYear()}-${date.getFullYear() + 1}`
                : `${date.getFullYear() - 1}-${date.getFullYear()}`;
            })
          );
          
          const options = Array.from(years);
          if (!options.includes(getCurrentFY())) {
            options.push(getCurrentFY());
          }
          setFyOptions(options.sort());
          setSelectedYear(getCurrentFY());
        } else {
          const currentFY = getCurrentFY();
          setFyOptions([currentFY]);
          setSelectedYear(currentFY);
        }
      } catch (error) {
        console.error('Error fetching financial years:', error);
        const currentFY = getCurrentFY();
        setFyOptions([currentFY]);
        setSelectedYear(currentFY);
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

export const useFinancialYear = () => useContext(FinancialYearContext);