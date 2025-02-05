import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/types';

export const fetchInvoiceData = async (startDate: string, endDate: string) => {
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
};

export const fetchInvoiceMetrics = async (startDate: string, endDate: string) => {
  const invoices = await fetchInvoiceData(startDate, endDate);
  
  const totalSales = invoices.reduce((sum, inv) => sum + inv.invTotal, 0);
  const totalPayments = invoices.reduce((sum, inv) => 
    sum + (inv.paymentTransactions?.reduce((pSum, p) => pSum + p.amount, 0) || 0), 
  0);
  
  return {
    totalSales,
    pendingPayments: totalSales - totalPayments,
    totalInvoices: invoices.length,
  };
};