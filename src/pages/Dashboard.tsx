import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { DashboardGridLayout } from "@/components/DashboardGridLayout";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();
  const isITAdmin = user?.role === "it_admin";

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
      const serializedLayout = widgets.map(({ content, ...rest }) => rest);

      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          layout: serializedLayout,
          created_by: user?.id,
          is_active: true,
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

  useEffect(() => {
    async function fetchLayout() {
      if (!user) return;

      const { data: layoutData } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (layoutData?.layout) {
        const fetchedLayout = layoutData.layout as [];
        const updatedWidgets = widgets.map((widget) => {
          const layoutItem = fetchedLayout.find((item: any) => item.i === widget.id);
          return layoutItem ? { ...widget, ...layoutItem } : widget;
        });
        
        setWidgets(updatedWidgets);
      }
    }

    fetchLayout();
  }, [user]);

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