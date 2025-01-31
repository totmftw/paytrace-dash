import { startOfDay, endOfDay, format } from 'date-fns';

export const getCurrentFinancialYear = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  
  return currentMonth >= 4 
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;
};

export const getFinancialYearDates = (year: string) => {
  const [startYear] = year.split('-').map(Number);
  const start = startOfDay(new Date(startYear, 3, 1)); // April 1st
  const end = endOfDay(new Date(startYear + 1, 2, 31)); // March 31st next year
  return { start, end };
};

export const formatFinancialYear = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
};