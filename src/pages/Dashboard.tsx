import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { DashboardGridLayout } from "@/components/DashboardGridLayout";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();

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
    }
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

  return (
    <div className="space-y-8 p-8">
      <DashboardGridLayout 
        widgets={widgets}
        onApply={handleApplyLayout}
      />
    </div>
  );
}