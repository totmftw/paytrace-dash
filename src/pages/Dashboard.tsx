// Dashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/Overview";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();
  // Dashboard.tsx
const { totalRevenue, outstandingAmount, totalReceivables } = dashboardData || {};

// ...

<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  <MetricsCard
    title="Total Revenue"
    amount={totalRevenue}
    status="success"
    onViewDetails={() => {}}
  />
  <MetricsCard
    title="Outstanding Amount"
    amount={outstandingAmount}
    status="danger"
    onViewDetails={() => {}}
  />
  <MetricsCard
    title="Total Receivables"
    amount={totalReceivables}
    status="warning"
    onViewDetails={() => {}}
  />
</div>

<PaymentTrends timeframe={timeFrame} />
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-stats', selectedYear],
    queryFn: async () => {
      const { data: payments } = await supabase
        .from('"paymentTransactions"')
        .select('"amount"')
        .gte('"paymentDate"', start.toISOString())
        .lte('"paymentDate"', end.toISOString());
  
      const { data: invoices } = await supabase
        .from('"invoiceTable"')
        .select('"invTotal", "invBalanceAmount", "invDuedate"')
        .gte('"invDate"', start.toISOString())
        .lte('"invDate"', end.toISOString());
  
      return {
        totalRevenue: payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        outstandingAmount: invoices?.filter(i => new Date(i.invDuedate) < new Date() && i.invBalanceAmount > 0)
          .reduce((sum, i) => sum + Number(i.invBalanceAmount), 0) || 0,
        pendingAmount: invoices?.filter(i => new Date(i.invDuedate) >= new Date() && i.invBalanceAmount > 0)
          .reduce((sum, i) => sum + Number(i.invBalanceAmount), 0) || 0,
        totalReceivables: (invoices?.reduce((sum, i) => sum + Number(i.invTotal), 0) || 0) -
          (payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0)
      };
    },
    enabled: !!selectedYear
  });

  // Authentication check...
  
  return (
    <div className="space-y-6 bg-[#E6EFE9]">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#1B4332]">Dashboard</h2>
        <FinancialYearSelector />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        {/* ... tabs content remains unchanged ... */}
      </Tabs>
    </div>
  );
}