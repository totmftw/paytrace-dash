import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { PaymentMetrics } from "@/components/PaymentMetrics";
import { SalesOverview } from "@/components/SalesOverview";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { PaymentMetrics } from "@/components/PaymentMetrics";
import { SalesOverview } from "@/components/SalesOverview";
import { CustomerStats } from "@/components/CustomerStats";
import { RecentSales } from "@/components/RecentSales";
import { PaymentTracking } from "@/components/PaymentTracking";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { PaymentMetrics } from "@/components/PaymentMetrics";
import { IncomeVsExpenses } from "@/components/IncomeVsExpenses";
import { SalesOverview } from "@/components/SalesOverview";
import { RecentSales } from "@/components/RecentSales";

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <FinancialYearSelector />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PaymentMetrics />
        <SalesOverview />
        <IncomeVsExpenses />
        <RecentSales />
      </div>
    </div>
  );
}
export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <FinancialYearSelector />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PaymentMetrics />
        <SalesOverview />
        <CustomerStats />
        <PaymentTracking />
        <RecentSales />
      </div>
    </div>
  );
}
const cardStyles =
  "bg-white p-4 rounded shadow flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow";

export default function Dashboard() {
  const { data: dashboardData, error } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*");
      return data;
    },
  });

  useEffect(() => {
    if (error) {
      // Handle error if needed
    }
  }, [error]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <FinancialYearSelector />
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-4 md:col-span-2 lg:col-span-3">
          <SalesOverview />
        </div>

        <div className="col-span-4 md:col-span-2 lg:col-span-1">
          <PaymentMetrics />
        </div>
      </div>
    </div>
  );
}
export default function Dashboard() {
  const { selectedYear } = useFinancialYear();

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <FinancialYearSelector />
      </div>

      {/* Rest of the dashboard */}
    </div>
  );
}
export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: dashboardData, error: dashboardError } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      if (!user) {
        throw new Error("No authenticated session");
      }

      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (dashboardError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
      });
    }
  }, [dashboardError, toast]);

  const getVariant = (status: string) => {
    switch (status) {
      case 'normal':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'danger':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <FinancialYearSelector />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData?.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.metric_name}
              </CardTitle>
              <Badge variant={getVariant(metric.metric_status)}>
                {metric.metric_status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.metric_type === 'currency' 
                  ? formatCurrency(metric.metric_value)
                  : metric.metric_value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PaymentReminders />
      </div>
    </div>
  );
}