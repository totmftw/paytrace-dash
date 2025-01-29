import { createContext, useContext, useState, useEffect } from "react";
import { format, addYears, subYears } from "date-fns";

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

const generateFYOptions = (currentFY: number) => 
  Array.from({ length: 5 }, (_, i) => {
    const year = currentFY - i;
    return `${year}-${year + 1}`;
  });

export const FinancialYearProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fyOptions, setFyOptions] = useState<string[]>([]);

  useEffect(() => {
    const savedYear = localStorage.getItem('selectedFY');
    const currentFY = getCurrentFY();
    const options = generateFYOptions(currentFY);
    
    setFyOptions(options);
    setSelectedYear(savedYear || `${currentFY}-${currentFY + 1}`);
    setIsLoading(false);
  }, []);

  const handleYearChange = (year: string) => {
    if (!fyOptions.includes(year) || isTransitioning) return;
    setIsTransitioning(true);
    localStorage.setItem('selectedFY', year);
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