import { startOfDay, endOfDay } from 'date-fns';

export type TimeFrame = 'week' | 'month' | 'quarter';

export const getFinancialYearDates = (year: string) => {
  const [startYear] = year.split('-').map(Number);
  const start = startOfDay(new Date(startYear, 3, 1)); // April 1st
  const end = endOfDay(new Date(startYear + 1, 2, 31)); // March 31st next year
  return { start, end };
};

export const getCurrentFinancialYear = (): string => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  if (currentMonth <= 2) {
    return `${currentYear - 1}-${currentYear}`;
  }
  return `${currentYear}-${currentYear + 1}`;
};

export const getTimeFrameDates = (timeFrame: TimeFrame, date: Date = new Date()) => {
  const currentDate = new Date(date);
  let start = new Date(currentDate);
  let end = new Date(currentDate);

  switch (timeFrame) {
    case 'week':
      const day = currentDate.getDay();
      start.setDate(currentDate.getDate() - day);
      end.setDate(currentDate.getDate() + (6 - day));
      break;
    case 'month':
      start.setDate(1);
      end.setMonth(currentDate.getMonth() + 1);
      end.setDate(0);
      break;
    case 'quarter':
      const quarter = Math.floor(currentDate.getMonth() / 3);
      start.setMonth(quarter * 3);
      start.setDate(1);
      end.setMonth(quarter * 3 + 3);
      end.setDate(0);
      break;
  }

  return {
    start: startOfDay(start),
    end: endOfDay(end)
  };
};

export const formatFinancialYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month <= 2) {
    return `${year - 1}-${year}`;
  }
  return `${year}-${year + 1}`;
};

export const getFinancialYearRange = (startYear: number, endYear: number): string[] => {
  const years: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(`${year}-${year + 1}`);
  }
  return years;
};

export const isWithinFinancialYear = (date: Date, fyYear: string): boolean => {
  const [startYear] = fyYear.split('-').map(Number);
  const fyStart = new Date(startYear, 3, 1);
  const fyEnd = new Date(startYear + 1, 2, 31);
  
  return date >= fyStart && date <= fyEnd;
};