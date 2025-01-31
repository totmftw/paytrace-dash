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
// src/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { GridLayout, Responsive, WidthProvider } from 'react-grid-layout';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useFinancialYear } from '@/context/FinancialYearContext';
import { useUser } from '@/hooks/useUser';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = () => {
  const { user, isAdmin } = useUser();
  const supabase = useSupabaseClient();
  const { selectedYear, setSelectedYear } = useFinancialYear();
  const [layouts, setLayouts] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch saved layout
  useEffect(() => {
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('layout')
        .eq('is_active', true)
        .single();
      
      if (data) setLayouts(JSON.parse(data.layout));
    };
    fetchLayout();
  }, []);

  const saveLayout = async (newLayout) => {
    const { error } = await supabase
      .from('dashboard_layouts')
      .upsert({
        layout: JSON.stringify(newLayout),
        created_by: user.id,
        is_active: true
      });

    if (!error) {
      setIsEditing(false);
      // Show success toast
    }
  };

  return (
    <div className="p-4 bg-pastel-moss min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border rounded bg-white"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {`FY ${year}-${year + 1}`}
              </option>
            );
          })}
        </select>

        {isAdmin && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-leaf-green text-forest-green px-4 py-2 rounded"
          >
            {isEditing ? 'Save Layout' : 'Configure Layout'}
          </button>
        )}
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={(layout) => {
          if (isEditing) setLayouts({ ...layouts, lg: layout });
        }}
      >
        <div key="metrics" data-grid={{ x: 0, y: 0, w: 12, h: 2 }}>
          <MetricsGrid />
        </div>
        <div key="invoiceTable" data-grid={{ x: 0, y: 2, w: 8, h: 4 }}>
          <InvoiceTable />
        </div>
        <div key="salesChart" data-grid={{ x: 8, y: 2, w: 4, h: 4 }}>
          <SalesVsPaymentsChart />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;


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