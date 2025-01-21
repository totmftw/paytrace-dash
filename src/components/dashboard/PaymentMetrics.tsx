import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PaymentMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ["payment-metrics"],
    queryFn: async () => {
      const today = new Date();
      
      // Get all unpaid invoices
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname,
            custCreditperiod
          )
        `)
        .eq("invMarkcleared", false);

      if (error) throw error;

      const pendingPayments = {
        amount: 0,
        count: 0
      };

      const overduePayments = {
        amount: 0,
        count: 0
      };

      invoices?.forEach(invoice => {
        const dueDate = new Date(invoice.invDuedate);
        const amount = invoice.invTotal;

        if (dueDate < today) {
          overduePayments.amount += Number(amount);
          overduePayments.count++;
        } else {
          pendingPayments.amount += Number(amount);
          pendingPayments.count++;
        }
      });

      return [
        {
          title: "Pending Payments",
          amount: pendingPayments.amount,
          status: "warning",
          count: pendingPayments.count,
        },
        {
          title: "Overdue Payments",
          amount: overduePayments.amount,
          status: "danger",
          count: overduePayments.count,
        },
      ];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics?.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <AlertCircle
              className={`h-4 w-4 ${
                metric.status === "warning"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metric.amount)}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {metric.count} invoices
              </p>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}