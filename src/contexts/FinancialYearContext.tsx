import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentFinancialYear, getFinancialYearDates, TimeFrame } from "@/utils/financialYearUtils";

interface FinancialYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  getFYDates: () => { start: Date; end: Date };
  isLoading: boolean;
  fyOptions: string[];
  isTransitioning: boolean;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const FinancialYearContext = createContext<FinancialYearContextType>({
  selectedYear: '',
  setSelectedYear: () => {},
  getFYDates: () => ({ start: new Date(), end: new Date() }),
  isLoading: true,
  fyOptions: [],
  isTransitioning: false,
  timeFrame: 'month',
  setTimeFrame: () => {}
});

export const FinancialYearProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentFinancialYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fyOptions, setFyOptions] = useState<string[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');

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
        } else {
          // If no data exists, create default options
          const currentYear = new Date().getFullYear();
          const defaultOptions = [
            `${currentYear-2}-${currentYear-1}`,
            `${currentYear-1}-${currentYear}`,
            `${currentYear}-${currentYear+1}`
          ];
          setFyOptions(defaultOptions);
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

  const getFYDates = () => getFinancialYearDates(selectedYear);

  return (
    <FinancialYearContext.Provider 
      value={{ 
        selectedYear, 
        setSelectedYear: handleYearChange, 
        getFYDates, 
        isLoading,
        fyOptions,
        isTransitioning,
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