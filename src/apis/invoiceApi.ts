// src/apis/invoiceApi.ts
import { supabase } from '@/integrations/supabase/client';

export const fetchInvoiceData = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('invoiceTable')
    .select(
      `
        *,
        customerMaster!invoiceTable_invCustid_fkey (
          custBusinessname
        ),
        paymentTransactions!paymentTransactions_invId_fkey (
          paymentId,
          amount,
          paymentDate
        )
      `
    )
    .gte('invDate', startDate)
    .lte('invDate', endDate);

  if (error) throw error;
  return data as Invoice[];
};