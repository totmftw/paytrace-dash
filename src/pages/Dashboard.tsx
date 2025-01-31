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
import { useLayouts } from "@/hooks/useLayouts";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();
  const isITAdmin = user?.role === "it_admin";
  const { saveLayout, resetLayout, undo, redo } = useLayouts();

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
    {
      id: "sales-vs-payments",
      x: 0,
      y: 8,
      w: 12,
      h: 5,
      content: <SalesVsPaymentsChart />,
    },
  ];

  useEffect(() => {
    const saveLayout = async () => {
      if (!user) return;

      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          created_by: user.id,
          layout: widgets.map(widget => ({
            i: widget.id,
            x: widget.x,
            y: widget.y,
            w: widget.w,
            h: widget.h
          })),
          is_active: true,
        });

      if (error) {
        throw error;
      }
    };

    saveLayout();
  }, [widgets, user]);

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <FinancialYearSelector />
          {isITAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => saveLayout(widgets)}>Save Layout</Button>
              <Button onClick={resetLayout}>Reset Layout</Button>
              <Button onClick={undo}>Undo</Button>
              <Button onClick={redo}>Redo</Button>
            </div>
          )}
        </div>
      </div>

      <DashboardGridLayout 
        widgets={widgets}
      />
    </div>
  );
}

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [popupData, setPopupData] = useState<any[]>([]);
  const [popupTitle, setPopupTitle] = useState<string>("");

  const handleDetail = async (type: string, data?: any) => {
    setIsPopupOpen(true);
    if (data) setPopupData(data);
    setPopupTitle(type);
  };

  const handleApplyLayout = async (newLayout: any) => {
    try {
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          layout: newLayout,
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

  return (
    <div className="space-y-8 p-8">
      {isITAdmin && (
        <div className="flex items-center justify-between mb-4">
          <Button variant={isEditing ? "destructive" : "outline"} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Configure Layout"}
          </Button>
          {isEditing && (
            <Button onClick={() => handleApplyLayout(gridLayout)}>
              Apply Changes
            </Button>
          )}
        </div>
      )}
      <DashboardGridLayout
        widgets={gridLayout || defaultWidgets}
        onApply={handleApplyLayout}
      />
      <DetailedDataTable
        title={popupTitle}
        data={popupData}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}