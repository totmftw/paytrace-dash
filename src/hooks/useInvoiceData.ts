// src/hooks/useInvoiceData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchInvoiceData } from '@/utils/supabaseQueries';

export const useInvoiceData = (year: string) => {
  return useQuery(['invoices', year], async () => {
    const [startYear, endYear] = year.split('-');
    const startDate = `${startYear}-04-01`;
    const endDate = `${endYear}-03-31`;
    return await fetchInvoiceData(startDate, endDate);
  });
};