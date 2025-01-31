import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// src/hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils';
import { Invoice, MetricsSummary } from '@/types';

interface Options {
  selectedYear: string;
  additionalColumns?: string[];
}

export const useDashboardData = ({ selectedYear, additionalColumns }: Options) => {
  const [start, end] = selectedYear.split('-');
  const startDate = `${start}-04-01`;
  const endDate = `${end}-03-31`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-data', selectedYear],
    queryFn: async () => {
      const baseQuery = `
        *,
        customerMaster!invoiceTable_invCustid_fkey (
          custBusinessname,
          custCreditperiod
        ),
        paymentTransactions!paymentTransactions_invId_fkey (
          paymentId,
          amount,
          paymentDate
        )
      `;
      const { data: invoices } = await supabase
        .from('invoiceTable')
        .select(baseQuery + (additionalColumns ? `, ${additionalColumns}` : ''))
        .gte('invDate', startDate)
        .lte('invDate', endDate);

      const processedInvoices = invoices as Invoice[];
      const payments = processedInvoices.reduce((sum, invoice) => {
        return sum + invoice.paymentTransactions.reduce((sumP, payment) => sumP + payment.amount, 0);
      }, 0);

      return {
        ...processedInvoices.reduce(
          (acc, invoice) => ({
            totalSales: acc.totalSales + invoice.invTotal,
            pendingPayments: acc.pendingPayments + (invoice.invTotal - payments),
            outstandingPayments: acc.outstandingPayments + (invoice.invTotal - payments),
            totalInvoices: acc.totalInvoices + 1,
          }),
          { totalSales: 0, pendingPayments: 0, outstandingPayments: 0, totalInvoices: 0 }
        ),
        invoices: processedInvoices,
      } as MetricsSummary;
    },
  });

  return { data, isLoading, error, formatCurrency };
};
export const useDashboardData = (selectedYear: string) => {
  const [start, end] = selectedYear.split('-');
  const startDate = `${start}-04-01`;
  const endDate = `${end}-03-31`;

  return useQuery({
    queryKey: ["dashboard-metrics", selectedYear],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from("invoiceTable")
        .select(`*, paymentTransactions:paymentTransactions_invId_fkey (amount)`)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      const totalSales = invoices.reduce((sum, inv) => sum + inv.invTotal, 0);
      const pendingPayments = invoices.filter(inv => new Date(inv.invDuedate) > new Date()).reduce((sum, inv) => sum + (inv.invTotal - inv.paymentTransactions.reduce((sum, p) => sum + p.amount, 0)), 0);
      const outstandingPayments = invoices.filter(inv => new Date(inv.invDuedate) < new Date()).reduce((sum, inv) => sum + (inv.invTotal - inv.paymentTransactions.reduce((sum, p) => sum + p.amount, 0)), 0);
      const totalInvoices = invoices.length;

      return { totalSales, pendingPayments, outstandingPayments, totalInvoices };
    },
  });
};