import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { DashboardGridLayout } from "@/components/DashboardGridLayout";
import { Button } from "@/components/ui/button";
import { Json } from "@/integrations/supabase/types";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();
  const isITAdmin = user?.role === "it_admin";

  const { data: dashboardData, error } = useQuery({
    queryKey: ["dashboard-metrics", selectedYear],
    queryFn: async () => {
      if (!user) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const widgets = [
    {
      id: "payment-metrics",
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      content: <PaymentMetrics />,
    },
    {
      id: "sales-overview",
      x: 6,
      y: 0,
      w: 6,
      h: 4,
      content: <SalesOverview />,
    },
    {
      id: "customer-stats",
      x: 0,
      y: 4,
      w: 4,
      h: 4,
      content: <CustomerStats />,
    },
    {
      id: "payment-tracking",
      x: 4,
      y: 4,
      w: 4,
      h: 4,
      content: <PaymentTracking />,
    },
    {
      id: "recent-sales",
      x: 8,
      y: 4,
      w: 4,
      h: 4,
      content: <RecentSales />,
    },
  ];

  const handleApplyLayout = async () => {
    try {
      const serializedLayout = widgets.map(({ content, ...rest }) => rest) as unknown as Json;
      
      const { error } = await supabase
        .from("dashboard_layouts")
        .insert({
          layout: serializedLayout,
          created_by: user?.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dashboard layout has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update dashboard layout.",
      });
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <FinancialYearSelector />
          {isITAdmin && (
            <Button onClick={handleApplyLayout}>
              Apply Layout
            </Button>
          )}
        </div>
      </div>

      <DashboardGridLayout 
        widgets={widgets}
        onApply={handleApplyLayout}
      />
    </div>
  );
}