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

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();

  const { data: dashboardData, error } = useQuery({
    queryKey: ["dashboard-metrics"],
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
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
      });
    }
  }, [error, toast]);

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PaymentMetrics />
        <SalesOverview />
        <CustomerStats />
        <PaymentTracking />
        <RecentSales />
      </div>
    </div>
  );
}