import { createContext, useContext, useState, useEffect } from "react";
import { format, addYears, subYears } from "date-fns";
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
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

export const FinancialYearProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState('');
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
                ? date.getFullYear() 
                : date.getFullYear() - 1;
            })
          );
          
          const options = Array.from(years).map(year => `${year}-${year + 1}`);
          setFyOptions(options);
          setSelectedYear(options[options.length - 1]);
        } else {
          const currentFY = getCurrentFY();
          setFyOptions([`${currentFY}-${currentFY + 1}`]);
          setSelectedYear(`${currentFY}-${currentFY + 1}`);
        }
      } catch (error) {
        console.error('Error fetching financial years:', error);
        const currentFY = getCurrentFY();
        setFyOptions([`${currentFY}-${currentFY + 1}`]);
        setSelectedYear(`${currentFY}-${currentFY + 1}`);
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
      start: new Date(startYear, 3, 1),
      end: new Date(startYear + 1, 2, 31)
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