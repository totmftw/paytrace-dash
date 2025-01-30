import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";

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
        .select("*")
        .single();

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
      case 'success':
        return 'default';
      case 'warning':
        return 'warning';
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
        {dashboardData?.metrics.map((metric: any) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Badge variant={getVariant(metric.status)}>
                {metric.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.type === 'currency' 
                  ? formatCurrency(metric.value)
                  : metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
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