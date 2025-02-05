import { useContext } from 'react';
import { FinancialYearContext } from '@/contexts/FinancialYearContext';

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return {
    currentYear: context.selectedYear,
    setCurrentYear: context.setSelectedYear
  };
};