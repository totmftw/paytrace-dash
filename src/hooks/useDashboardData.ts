import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types';

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
      const { data: invoices = [] } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      const totalSales = invoices.reduce((sum, inv) => sum + inv.invTotal, 0);
      const pendingPayments = invoices
        .filter(inv => new Date(inv.invDuedate) > new Date())
        .reduce((sum, inv) => sum + (inv.invTotal - (inv.paymentTransactions?.reduce((s, p) => s + p.amount, 0) || 0)), 0);
      const outstandingPayments = invoices
        .filter(inv => new Date(inv.invDuedate) < new Date())
        .reduce((sum, inv) => sum + (inv.invTotal - (inv.paymentTransactions?.reduce((s, p) => s + p.amount, 0) || 0)), 0);

      return {
        totalSales,
        pendingPayments,
        outstandingPayments,
        totalInvoices: invoices.length,
        invoices: invoices as Invoice[]
      };
    },
  });
};