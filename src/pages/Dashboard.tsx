import { useState, useEffect } from "react";
import { Responsive, WidthProvider, Layouts as ReactGridLayouts } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Settings, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { OutstandingPayments } from "@/components/dashboard/OutstandingPayments";
import { TopCustomers } from "@/components/dashboard/TopCustomers";
import { PaymentTrends } from "@/components/dashboard/PaymentTrends";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

type Layouts = {
  [key: string]: Layout[];
};

const defaultLayouts: Layouts = {
  lg: [
    { i: "revenue", x: 0, y: 0, w: 8, h: 8 },
    { i: "customerStats", x: 8, y: 0, w: 4, h: 4 },
    { i: "recentTransactions", x: 8, y: 4, w: 4, h: 4 },
    { i: "outstandingPayments", x: 0, y: 8, w: 4, h: 6 },
    { i: "topCustomers", x: 4, y: 8, w: 4, h: 6 },
    { i: "paymentTrends", x: 8, y: 8, w: 4, h: 6 }
  ]
};

export default function Dashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [layouts, setLayouts] = useState<ReactGridLayouts>(defaultLayouts);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadLayout = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('dashboard_config')
          .select('layout')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.layout) {
          const layoutData = data.layout as { [key: string]: Layout[] };
          if ('lg' in layoutData) {
            setLayouts(layoutData as ReactGridLayouts);
          }
        }
      } catch (error) {
        console.error('Error loading layout:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard layout",
        });
      }
    };

    loadLayout();
  }, [user?.id, toast]);

  const saveLayout = async (layout: ReactGridLayouts) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('dashboard_config')
        .upsert({
          user_id: user.id,
          layout: layout as any,
          widgets: {}
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dashboard layout saved successfully",
      });
    } catch (error) {
      console.error('Error saving layout:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save dashboard layout",
      });
    }
  };

  const handleLayoutChange = (currentLayout: Layout[]) => {
    if (isEditing) {
      const newLayouts: ReactGridLayouts = {
        ...layouts,
        lg: currentLayout
      };
      setLayouts(newLayouts);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      saveLayout(layouts);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <FinancialYearSelector />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleEdit}
            className={isEditing ? "bg-green-500 text-white" : ""}
          >
            {isEditing ? (
              <Check className="h-4 w-4" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
      >
        <Card key="revenue" className="p-4">
          <RevenueChart />
        </Card>
        <Card key="customerStats" className="p-4">
          <CustomerStats />
        </Card>
        <Card key="recentTransactions" className="p-4">
          <RecentTransactions />
        </Card>
        <Card key="outstandingPayments" className="p-4">
          <OutstandingPayments />
        </Card>
        <Card key="topCustomers" className="p-4">
          <TopCustomers />
        </Card>
        <Card key="paymentTrends" className="p-4">
          <PaymentTrends />
        </Card>
      </ResponsiveGridLayout>
    </div>
  );
}