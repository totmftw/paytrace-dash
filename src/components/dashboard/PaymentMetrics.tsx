import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function PaymentMetrics() {
  const { selectedYear } = useFinancialYear();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const { data: metrics } = useQuery({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      const { start, end } = getFYDates(selectedYear);
      
      const { data: invoices } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname
          )
        `)
        .gte("invDate", start.toISOString())
        .lte("invDate", end.toISOString());

      const { data: payments } = await supabase
        .from("paymentTransactions")
        .select("*");

      const now = new Date();
      
      const pendingPayments = invoices?.filter(inv => 
        new Date(inv.invDuedate) > now
      ) || [];
      
      const outstandingPayments = invoices?.filter(inv => 
        new Date(inv.invDuedate) < now
      ) || [];

      const totalPendingAmount = pendingPayments.reduce((sum, inv) => 
        sum + (inv.invTotal - (payments?.filter(p => p.invId === inv.invId)
          .reduce((psum, p) => psum + p.amount, 0) || 0)), 0);

      const totalOutstandingAmount = outstandingPayments.reduce((sum, inv) => 
        sum + (inv.invTotal - (payments?.filter(p => p.invId === inv.invId)
          .reduce((psum, p) => psum + p.amount, 0) || 0)), 0);

      const totalSales = invoices?.reduce((sum, inv) => sum + inv.invTotal, 0) || 0;
      const totalOrders = invoices?.length || 0;

      return {
        pendingPayments,
        outstandingPayments,
        totalPendingAmount,
        totalOutstandingAmount,
        totalSales,
        totalOrders,
        allInvoices: invoices || [],
      };
    },
  });

  const handleMetricClick = (type: string) => {
    switch (type) {
      case "pending":
        setSelectedData(metrics?.pendingPayments || []);
        setDialogTitle("Pending Payments");
        break;
      case "outstanding":
        setSelectedData(metrics?.outstandingPayments || []);
        setDialogTitle("Outstanding Payments");
        break;
      case "sales":
        setSelectedData(metrics?.allInvoices || []);
        setDialogTitle("Total Sales");
        break;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleMetricClick("pending")}
        >
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalPendingAmount || 0)}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleMetricClick("outstanding")}
        >
          <CardHeader>
            <CardTitle>Outstanding Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalOutstandingAmount || 0)}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleMetricClick("sales")}
        >
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalOrders || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <DetailedDataTable
        title={dialogTitle}
        data={selectedData}
        onClose={() => {
          setSelectedData([]);
          setDialogTitle("");
        }}
      />
    </>
  );
}

function getFYDates(year: string) {
  const [startYear] = year.split('-').map(Number);
  const start = new Date(startYear, 3, 1); // April 1st
  const end = new Date(startYear + 1, 2, 31); // March 31st next year
  return { start, end };
}