import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentDetailsTable } from "./PaymentDetailsTable";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useToast } from "@/hooks/use-toast"; // Fixed import

export const PaymentMetrics = () => {
  const { selectedYear } = useFinancialYear();
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [showOverduePayments, setShowOverduePayments] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const { toast } = useToast();

  const getFinancialYearStart = (year: string) => {
    const yearNum = parseInt(year.split('-')[0]);
    return new Date(yearNum, 3, 1).toISOString();
  };

  const getFinancialYearEnd = (year: string) => {
    const yearNum = parseInt(year.split('-')[0]);
    return new Date(yearNum + 1, 2, 31).toISOString();
  };

  const { data: metrics, error: metricsError } = useQuery({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      try {
        const startDate = getFinancialYearStart(selectedYear);
        const endDate = getFinancialYearEnd(selectedYear);

        const { data: invoices, error } = await supabase
          .from("invoiceTable")
          .select(`
            *,
            customerMaster (
              custBusinessname,
              custCreditperiod
            )
          `)
          .gte('invDate', startDate.split('T')[0])
          .lte('invDate', endDate.split('T')[0])
          .order('invDuedate', { ascending: true });

        if (error) throw error;

      const pendingPayments = {
        amount: 0,
        count: 0,
        invoices: []
      };

      const overduePayments = {
        amount: 0,
        count: 0,
        invoices: []
      };

      const orders = {
        count: 0,
        invoices: []
      };

      invoices?.forEach(invoice => {
        const dueDate = new Date(invoice.invDuedate);
        const amount = invoice.invTotal;

        if (dueDate < new Date()) {
          overduePayments.amount += Number(amount);
          overduePayments.count++;
          overduePayments.invoices.push(invoice);
        } else if (!invoice.invMarkcleared) {
          pendingPayments.amount += Number(amount);
          pendingPayments.count++;
          pendingPayments.invoices.push(invoice);
        }

        orders.count++;
        orders.invoices.push(invoice);
      });

        return [
          {
            title: "Pending Payments",
            amount: pendingPayments.amount,
            status: "warning",
            count: pendingPayments.count,
            invoices: pendingPayments.invoices
          },
          {
            title: "Overdue Payments",
            amount: overduePayments.amount,
            status: "danger",
            count: overduePayments.count,
            invoices: overduePayments.invoices
          },
          {
            title: "Orders",
            count: orders.count,
            invoices: orders.invoices
          }
        ];
      } catch (error: any) {
        console.error('Error fetching metrics:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payment metrics. Please check your connection and try again.",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (metricsError) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Error Loading Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Failed to load payment metrics. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics?.map((metric, index) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">
                {metric.title}
              </CardTitle>
              {metric.status && (
                <AlertCircle
                  className={`h-4 w-4 ${
                    metric.status === "warning"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {metric.title === "Orders" ? metric.count : formatCurrency(metric.amount)}
              </div>
              <div className="flex items-center justify-between">
                {metric.title !== "Orders" && (
                  <p className="text-xs text-muted-foreground">
                    {metric.count} invoices
                  </p>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    if (index === 0) setShowPendingPayments(true);
                    else if (index === 1) setShowOverduePayments(true);
                    else if (index === 2) setShowOrders(true);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog 
        open={showPendingPayments} 
        onOpenChange={setShowPendingPayments}
      >
        <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-black">Pending Payments</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPendingPayments(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <PaymentDetailsTable 
              data={metrics?.[0].invoices || []}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showOverduePayments} 
        onOpenChange={setShowOverduePayments}
      >
        <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-black">Overdue Payments</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOverduePayments(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <PaymentDetailsTable 
              data={metrics?.[1].invoices || []}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showOrders} 
        onOpenChange={setShowOrders}
      >
        <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-black">Orders</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOrders(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <PaymentDetailsTable 
              data={metrics?.[2].invoices || []}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
