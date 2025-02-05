// src/utils/supabaseQueries.ts
import { supabase } from '@/integrations/supabase/client';

export const fetchInvoiceData = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('invoiceTable')
    .select(`
      *,
      customerMaster!invoiceTable_invCustid_fkey (
        custBusinessname,
        custCreditperiod,
        custWhatsapp
      ),
      paymentTransactions (
        paymentId,
        amount,
        paymentDate,
        transactionId,
        paymentMode,
        chequeNumber,
        bankName,
        remarks
      )
    `)
    .gte('invDate', startDate)
    .lte('invDate', endDate);

  if (error) throw error;
  return data;
};