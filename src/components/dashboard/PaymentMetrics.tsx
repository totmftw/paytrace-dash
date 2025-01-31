import { useState } from "react";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricsCard } from "@/components/MetricsCard";
import { DetailedDataTable } from "@/components/DetailedDataTable";

interface PaymentMetricsData {
  pendingAmount: number;
  outstandingAmount: number;
  totalSales: number;
  totalOrders: number;
  pendingInvoices: any[];
  outstandingInvoices: any[];
  allInvoices: any[];
}

export function PaymentMetrics() {
  const { selectedYear } = useFinancialYear();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const { data } = useQuery<PaymentMetricsData>({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod
          ),
          paymentTransactions:paymentTransactions (
            amount
          )
        `)
        .gte("invDate", selectedYear.split('-')[0] + "-04-01")
        .lte("invDate", selectedYear.split('-')[1] + "-03-31");

      if (error) throw error;

      const today = new Date();
      const pendingInvoices = invoices.filter(
        (inv) => new Date(inv.invDuedate) > today
      );
      const outstandingInvoices = invoices.filter(
        (inv) => new Date(inv.invDuedate) < today
      );

      return {
        pendingAmount: pendingInvoices.reduce((sum, inv) => sum + inv.invTotal, 0),
        outstandingAmount: outstandingInvoices.reduce((sum, inv) => sum + inv.invTotal, 0),
        totalSales: invoices.reduce((sum, inv) => sum + inv.invTotal, 0),
        totalOrders: invoices.length,
        pendingInvoices,
        outstandingInvoices,
        allInvoices: invoices,
      };
    },
  });

  const handleMetricClick = (type: string) => {
    if (!data) return;

    switch (type) {
      case "pending":
        setSelectedData(data.pendingInvoices);
        setDialogTitle("Pending Payments");
        break;
      case "outstanding":
        setSelectedData(data.outstandingInvoices);
        setDialogTitle("Outstanding Payments");
        break;
      case "sales":
        setSelectedData(data.allInvoices);
        setDialogTitle("Total Sales");
        break;
      case "orders":
        setSelectedData(data.allInvoices);
        setDialogTitle("Total Orders");
        break;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <MetricsCard
          title="Pending Payments"
          value={data?.pendingAmount || 0}
          onClick={() => handleMetricClick("pending")}
        />
        <MetricsCard
          title="Outstanding Payments"
          value={data?.outstandingAmount || 0}
          onClick={() => handleMetricClick("outstanding")}
        />
        <MetricsCard
          title="Total Sales"
          value={data?.totalSales || 0}
          onClick={() => handleMetricClick("sales")}
        />
        <MetricsCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          onClick={() => handleMetricClick("orders")}
        />
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