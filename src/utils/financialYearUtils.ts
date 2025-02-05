export type TimeFrame = 'day' | 'week' | 'month' | 'quarter' | 'year';

export function getCurrentFinancialYear(): string {
  const today = new Date();
  const month = today.getMonth() + 1; // JavaScript months are 0-based
  const year = today.getFullYear();
  
  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export function getFinancialYearDates(fy: string): { start: Date; end: Date } {
  const [startYear, endYear] = fy.split('-').map(Number);
  return {
    start: new Date(`${startYear}-04-01`),
    end: new Date(`${endYear}-03-31`)
  };
}