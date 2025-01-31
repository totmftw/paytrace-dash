import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricsSummary, Invoice } from "@/types/dashboard";

export const useDashboardData = (selectedYear: string) => {
  const [startDate, endDate] = selectedYear.split('-');
  const fyStartDate = `${startDate}-04-01`;
  const fyEndDate = `${endDate}-03-31`;
  const today = new Date().toISOString();

  return useQuery({
    queryKey: ["dashboard-metrics", selectedYear],
    queryFn: async (): Promise<MetricsSummary> => {
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          ),
          paymentTransactions (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", fyStartDate)
        .lte("invDate", fyEndDate);

      if (error) throw error;

      const processedInvoices = invoices as Invoice[];
      const pendingInvoices = processedInvoices.filter(
        inv => new Date(inv.invDuedate) > new Date(today)
      );
      const outstandingInvoices = processedInvoices.filter(
        inv => new Date(inv.invDuedate) < new Date(today)
      );

      const calculateBalance = (invoice: Invoice) => {
        const payments = invoice.paymentTransactions?.reduce(
          (sum, payment) => sum + payment.amount, 
          0
        ) || 0;
        return invoice.invTotal - payments;
      };

      const pendingAmount = pendingInvoices.reduce(
        (sum, inv) => sum + calculateBalance(inv),
        0
      );

      const outstandingAmount = outstandingInvoices.reduce(
        (sum, inv) => sum + calculateBalance(inv),
        0
      );

      const totalSales = processedInvoices.reduce(
        (sum, inv) => sum + inv.invTotal,
        0
      );

      return {
        pendingAmount,
        outstandingAmount,
        totalSales,
        totalOrders: processedInvoices.length,
        pendingInvoices,
        outstandingInvoices,
        allInvoices: processedInvoices,
      };
    },
  });
};