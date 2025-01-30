import { startOfDay, endOfDay, format } from 'date-fns';

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
  
  // If current month is January to March (0-2), we're in the previous year's FY
  if (currentMonth <= 2) {
    return `${currentYear - 1}-${currentYear}`;
  }
  return `${currentYear}-${currentYear + 1}`;
};

export const formatFinancialYearDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const getDateRangeForTimeFrame = (date: Date, timeFrame: TimeFrame) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  switch (timeFrame) {
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return { start: weekStart, end: weekEnd };
      
    case 'month':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0)
      };
      
    case 'quarter':
      const quarterMonth = Math.floor(month / 3) * 3;
      return {
        start: new Date(year, quarterMonth, 1),
        end: new Date(year, quarterMonth + 3, 0)
      };
      
    default:
      throw new Error(`Invalid timeframe: ${timeFrame}`);
  }
};

export const groupByTimeFrame = (data: any[], timeframe: TimeFrame) => {
  return data.reduce((acc, item) => {
    const date = new Date(item.transaction_date);
    let key: string;

    switch (timeframe) {
      case 'week':
        key = date.toISOString().substr(0, 10);
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
      case 'quarter':
        const quarter = Math.floor((date.getMonth() + 1) / 3);
        key = `${date.getFullYear()}-Q${quarter + 1}`;
        break;
    }
    acc[key] = (acc[key] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);
};