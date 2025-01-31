import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export const isDateBetween = (date: Date, start: Date, end: Date): boolean => {
  return dayjs(date).isBetween(start, end, 'day', '[]');
};

// Additional utility functions can be added here
export const formatDate = (date: Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const parseDate = (dateString: string): Date => {
  return dayjs(dateString).toDate();
};

export const isToday = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};
