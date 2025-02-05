
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/types';

export const useInvoiceData = (year?: string) => {
  return useQuery({
    queryKey: ['invoices', year],
    queryFn: async () => {
      let query = supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp,
            custPhone,
            custGST,
            custStatus,
            custType
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            invId,
            amount,
            paymentDate,
            transactionId,
            paymentMode,
            chequeNumber,
            bankName,
            remarks
          )
        `);

      // If year is provided, add date range filter
      if (year) {
        const [startYear] = year.split('-');
        query = query
          .gte("invDate", `${startYear}-04-01`)
          .lte("invDate", `${parseInt(startYear) + 1}-03-31`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }

      return data as Invoice[];
    },
  });
};
