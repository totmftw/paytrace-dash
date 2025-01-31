import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DashboardGridLayout } from "@/components/DashboardGridLayout";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { MetricsCard } from "@/components/dashboard/metrics/MetricsCard";
import { MetricsDetailPopup } from "@/components/dashboard/metrics/MetricsDetailPopup";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardWidget } from "@/types/dashboard";
import { SalesVsPaymentsChart } from "@/components/dashboard/SalesVsPaymentsChart";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === "it_admin";
  const { selectedYear } = useFinancialYear();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { data: metricsData } = useDashboardData(selectedYear);

  // Query to fetch user-specific layout from Supabase
  const { data: layoutData } = useQuery({
    queryKey: ["dashboard-layout", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mutation to update the layout in Supabase
  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          created_by: user.id,
          layout: newLayout,
          is_active: true,
        });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Layout saved successfully",
      });
    },
  });

  const defaultWidgets: DashboardWidget[] = [
    {
      id: "pending-payments",
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      content: (
        <MetricsCard
          title="Pending Payments"
          value={metricsData?.pendingAmount || 0}
          onClick={() => setSelectedMetric("pending")}
        />
      ),
    },
    {
      id: "outstanding-payments",
      x: 3,
      y: 0,
      w: 3,
      h: 2,
      content: (
        <MetricsCard
          title="Outstanding Payments"
          value={metricsData?.outstandingAmount || 0}
          onClick={() => setSelectedMetric("outstanding")}
        />
      ),
    },
    {
      id: "total-sales",
      x: 6,
      y: 0,
      w: 3,
      h: 2,
      content: (
        <MetricsCard
          title="Total Sales"
          value={metricsData?.totalSales || 0}
          onClick={() => setSelectedMetric("sales")}
        />
      ),
    },
    {
      id: "total-orders",
      x: 9,
      y: 0,
      w: 3,
      h: 2,
      content: (
        <MetricsCard
          title="Total Orders"
          value={metricsData?.totalOrders || 0}
          isMonetary={false}
          onClick={() => setSelectedMetric("orders")}
        />
      ),
    },
    {
      id: "invoice-table",
      x: 0,
      y: 2,
      w: 12,
      h: 4,
      content: <InvoiceTable />,
    },
    {
      id: "sales-vs-payments",
      x: 0,
      y: 6,
      w: 12,
      h: 4,
      content: <SalesVsPaymentsChart />,
    },
  ];

  const currentLayout = layoutData?.layout || defaultWidgets;

  const getMetricDetails = () => {
    if (!metricsData || !selectedMetric) return null;

    const metricMap = {
      pending: {
        title: "Pending Payments",
        data: metricsData.pendingInvoices,
      },
      outstanding: {
        title: "Outstanding Payments",
        data: metricsData.outstandingInvoices,
      },
      sales: {
        title: "Total Sales",
        data: metricsData.allInvoices,
      },
      orders: {
        title: "All Orders",
        data: metricsData.allInvoices,
      },
    };

    return metricMap[selectedMetric as keyof typeof metricMap];
  };

  const metricDetails = getMetricDetails();

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <FinancialYearSelector />
      </div>

      <DashboardGridLayout
        widgets={currentLayout}
        onLayoutChange={updateLayoutMutation.mutate}
        isEditMode={isITAdmin}
      />

      {metricDetails && (
        <MetricsDetailPopup
          title={metricDetails.title}
          invoices={metricDetails.data}
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
}