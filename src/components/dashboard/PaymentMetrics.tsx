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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PaymentMetrics() {
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [showOverduePayments, setShowOverduePayments] = useState(false);
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());

  const getFinancialYearStart = (year: number) => new Date(`${year}-04-01`).toISOString();
  const getFinancialYearEnd = (year: number) => new Date(`${year + 1}-03-31`).toISOString();

  const { data: metrics } = useQuery({
    queryKey: ["payment-metrics", financialYear],
    queryFn: async () => {
      const startDate = getFinancialYearStart(financialYear);
      const endDate = getFinancialYearEnd(financialYear);

      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname,
            custCreditperiod
          )
        `)
        .eq("invMarkcleared", false)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

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

      invoices?.forEach(invoice => {
        const dueDate = new Date(invoice.invDuedate);
        const amount = invoice.invTotal;

        if (dueDate < new Date()) {
          overduePayments.amount += Number(amount);
          overduePayments.count++;
          overduePayments.invoices.push(invoice);
        } else {
          pendingPayments.amount += Number(amount);
          pendingPayments.count++;
          pendingPayments.invoices.push(invoice);
        }
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
      ];
    },
    refetchInterval: 300000,
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          value={financialYear.toString()}
          onValueChange={(value) => setFinancialYear(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Financial Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}-{year + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {metrics?.map((metric, index) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">
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
              <div className="text-2xl font-bold text-black">
                {formatCurrency(metric.amount)}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {metric.count} invoices
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => index === 0 ? setShowPendingPayments(true) : setShowOverduePayments(true)}
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
              financialYear={financialYear}
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
              financialYear={financialYear}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}