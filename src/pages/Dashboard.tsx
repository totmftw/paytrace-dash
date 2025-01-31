import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricsCard } from "@/components/MetricsCard";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { BanknoteIcon, FileTextIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
import type { DashboardProps, Invoice } from "@/types/dashboard";
import { SalesVsPaymentsChart } from "@/components/SalesVsPaymentsChart";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { InvoiceTable } from "@/components/InvoiceTable";
// src/pages/Dashboard.tsx
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { useInvoiceData } from '@/hooks/useInvoiceData';

const Dashboard = () => {
  const { currentYear } = useFinancialYear();
  const { invoices, loading, error } = useInvoiceData(currentYear);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {/* Dashboard content will go here */}
    </div>
  );
};

export default Dashboard;

export default function Dashboard({ year }: DashboardProps) {
  const { selectedYear } = useFinancialYear();
  const [startYear, endYear] = selectedYear.split("-");
  const startDate = `${startYear}-04-01`;
  const endDate = `${Number(startYear) + 1}-03-31`;

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["dashboard-data", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp,
            custGST,
            custPhone
          ),
          paymentTransactions (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      if (error) throw error;
      return data as Invoice[];
    }
  });

  const totalSales = invoices?.reduce((sum, inv) => sum + inv.invTotal, 0) ?? 0;
  const totalPayments = invoices?.reduce((sum, inv) => 
    sum + (inv.paymentTransactions?.reduce((pSum, p) => pSum + p.amount, 0) || 0), 
  0) ?? 0;
  const pendingPayments = totalSales - totalPayments;
  const overdueInvoices = invoices?.filter(inv => 
    new Date(inv.invDuedate) < new Date() && 
    (inv.invTotal - (inv.paymentTransactions?.reduce((sum, p) => sum + p.amount, 0) || 0)) > 0
  ).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <FinancialYearSelector />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Sales"
          value={totalSales}
          icon={<BanknoteIcon className="h-6 w-6" />}
        />
        <MetricsCard
          title="Pending Payments"
          value={pendingPayments}
          icon={<AlertCircleIcon className="h-6 w-6" />}
        />
        <MetricsCard
          title="Total Invoices"
          value={invoices?.length ?? 0}
          icon={<FileTextIcon className="h-6 w-6" />}
          isMonetary={false}
        />
        <MetricsCard
          title="Overdue Invoices"
          value={overdueInvoices}
          icon={<CheckCircleIcon className="h-6 w-6" />}
          isMonetary={false}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <SalesVsPaymentsChart selectedYear={selectedYear} />
        <PaymentTracking />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
        <InvoiceTable 
          data={invoices || []} 
          isLoading={isLoading}
          visibleColumns={[
            'invNumber',
            'customerBusinessname',
            'invTotal',
            'invDate',
            'invDuedate',
            'status'
          ]}
        />
      </div>
    </div>
  );
}