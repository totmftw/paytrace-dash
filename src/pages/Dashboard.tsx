import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DashboardGridLayout } from "@/components/DashboardGridLayout";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { Json } from "@/integrations/supabase/types";
import { LayoutProvider } from "@/hooks/useLayouts";
import { FinancialYearFilter } from "@/components/dashboard/FinancialYearFilter";
import { Overview } from "@/components/dashboard/Overview";

const defaultWidgets = [
  {
    id: "payment-metrics",
    x: 0,
    y: 0,
    w: 12,
    h: 4,
    content: <PaymentMetrics />
  },
  {
    id: "sales-overview",
    x: 0,
    y: 4,
    w: 12,
    h: 4,
    content: <SalesOverview />
  },
  {
    id: "customer-stats",
    x: 0,
    y: 8,
    w: 6,
    h: 4,
    content: <CustomerStats />
  },
  {
    id: "payment-tracking",
    x: 6,
    y: 8,
    w: 6,
    h: 4,
    content: <PaymentTracking />
  }
];

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === "it_admin";

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
      
      if (error) {
        console.error("Error fetching layout:", error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      if (!user) throw new Error("No user");
      
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          created_by: user.id,
          layout: newLayout,
          is_active: true
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save layout"
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Layout saved successfully"
      });
    },
  });

  const currentWidgets = layoutData?.layout ? 
    defaultWidgets.map(widget => {
      const layoutArray = layoutData.layout as Json[];
      const layoutItem = Array.isArray(layoutArray) ? 
        layoutArray.find(l => 
          typeof l === 'object' && 
          l !== null && 
          'i' in l && 
          'x' in l &&
          'y' in l &&
          'w' in l &&
          'h' in l &&
          l.i === widget.id
        ) as unknown as LayoutItem | undefined : 
        undefined;
      
      return {
        ...widget,
        ...(layoutItem || {})
      };
    }) : 
    defaultWidgets;

  return (
    <LayoutProvider>
      <div className="flex flex-col h-screen">
        <header className="p-4">
          <FinancialYearFilter />
        </header>
        <main className="flex-1 p-4">
          <div className="h-full overflow-y-auto overflow-x-hidden bg-[#E8F3E8]">
            <div className="container mx-auto p-6">
              <DashboardGridLayout 
                widgets={currentWidgets} 
                onApply={updateLayoutMutation.mutate}
              />
            </div>
          </div>
        </main>
      </div>
    </LayoutProvider>
  );
}