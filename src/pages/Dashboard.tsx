import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DashboardGridLayout } from "@/components/DashboardGridLayout";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { ComponentDataProvider } from "@/contexts/ComponentDataContext";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { SalesVsPaymentsChart } from "@/components/dashboard/SalesVsPaymentsChart";
import { Layout } from "react-grid-layout";

interface DashboardWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const defaultWidgets: DashboardWidget[] = [
  { id: "payment-metrics", x: 0, y: 0, w: 6, h: 4 },
  { id: "sales-overview", x: 6, y: 0, w: 6, h: 4 },
  { id: "payment-tracking", x: 0, y: 4, w: 6, h: 4 },
  { id: "invoice-table", x: 6, y: 4, w: 6, h: 4 },
  { id: "sales-vs-payments", x: 0, y: 8, w: 12, h: 6 },
];

const widgetMap: Record<string, JSX.Element> = {
  "payment-metrics": <PaymentMetrics />,
  "sales-overview": <SalesOverview />,
  "payment-tracking": <PaymentTracking />,
  "invoice-table": <InvoiceTable />,
  "sales-vs-payments": <SalesVsPaymentsChart />,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === "it_admin";
  const { selectedYear } = useFinancialYear();

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

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: Layout[]) => {
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

  const currentLayout = layoutData?.layout || defaultWidgets;
  const widgets = defaultWidgets.map(widget => ({
    ...widget,
    component: widgetMap[widget.id],
  }));

  return (
    <ComponentDataProvider value={{ selectedYear }}>
      <FinancialYearSelector />
      <DashboardGridLayout
        widgets={widgets}
        layout={currentLayout}
        onLayoutChange={updateLayoutMutation.mutate}
        isEditMode={isITAdmin}
      />
    </ComponentDataProvider>
  );
}