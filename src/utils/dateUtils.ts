// src/utils/dateUtils.ts
import dayjs from "dayjs";

export const formatDate = (date: string) => dayjs(date).format("DD MMM YYYY");

export const isDateWithinFinancialYear = (date: string, financialYear: string) => {
  const [startYear, endYear] = financialYear.split("-");
  const startDate = dayjs(`${startYear}-04-01`);
  const endDate = dayjs(`${endYear}-03-31`);
  return dayjs(date).isBetween(startDate, endDate, null, "[]");
};

export const getFinancialYearRange = (financialYear: string) => {
  const [startYear, endYear] = financialYear.split("-");
  return {
    start: dayjs(`${startYear}-04-01`).toDate(),
    end: dayjs(`${endYear}-03-31`).toDate(),
  };
};