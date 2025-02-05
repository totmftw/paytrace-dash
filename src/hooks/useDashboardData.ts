
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/types';

interface DashboardData {
  totalSales: number;
  pendingPayments: number;
  outstandingPayments: number;
  totalInvoices: number;
  invoices: Invoice[];
}

export const useDashboardData = (selectedYear: string) => {
  const [start, end] = selectedYear.split('-');
  const startDate = `${start}-04-01`;
  const endDate = `${end}-03-31`;

  return useQuery({
    queryKey: ["dashboard-metrics", selectedYear],
    queryFn: async (): Promise<DashboardData> => {
      const { data: invoices = [], error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp,
            custPhone,
            custGST
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      if (error) throw error;

      const invoiceData = invoices as unknown as Invoice[];

      const totalSales = invoiceData.reduce((sum, inv) => sum + inv.invTotal, 0);
      const pendingPayments = invoiceData
        .filter(inv => new Date(inv.invDuedate) > new Date())
        .reduce((sum, inv) => sum + (inv.invTotal - (inv.paymentTransactions?.reduce((s, p) => s + p.amount, 0) || 0)), 0);
      const outstandingPayments = invoiceData
        .filter(inv => new Date(inv.invDuedate) < new Date())
        .reduce((sum, inv) => sum + (inv.invTotal - (inv.paymentTransactions?.reduce((s, p) => s + p.amount, 0) || 0)), 0);

      return {
        totalSales,
        pendingPayments,
        outstandingPayments,
        totalInvoices: invoiceData.length,
        invoices: invoiceData
      };
    },
  });
};
