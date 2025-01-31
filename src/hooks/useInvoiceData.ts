import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/types/dashboard';

export const useInvoiceData = (year: string) => {
  return useQuery({
    queryKey: ['invoices', year],
    queryFn: async () => {
      const [startYear, endYear] = year.split('-');
      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;
      
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custWhatsapp,
            custCreditperiod
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .gte('invDate', startDate)
        .lte('invDate', endDate);

      if (error) throw error;
      return data as unknown as Invoice[];
    }
  });
};