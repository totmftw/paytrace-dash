import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { MetricsCard } from "./MetricsCard";
import { getFinancialYearDates } from "@/utils/financialYearUtils";

export function PaymentMetrics() {
  const { selectedYear } = useFinancialYear();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const { data: metrics } = useQuery({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      const { start, end } = getFinancialYearDates(selectedYear);
      
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp
          ),
          paymentTransactions (
            amount,
            paymentId
          )
        `)
        .gte("invDate", start.toISOString().split('T')[0])
        .lte("invDate", end.toISOString().split('T')[0]);

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }

      const today = new Date();
      const totalSales = invoices?.reduce((sum, inv) => sum + inv.invTotal, 0) || 0;
      const totalOrders = invoices?.length || 0;

      // Calculate pending and outstanding payments
      const pendingPayments = invoices?.filter(inv => new Date(inv.invDuedate) > today) || [];
      const outstandingPayments = invoices?.filter(inv => new Date(inv.invDuedate) < today) || [];

      const totalPendingAmount = pendingPayments.reduce((sum, inv) => 
        sum + (inv.invTotal - inv.paymentTransactions.reduce((psum, p) => psum + p.amount, 0)), 0);

      const totalOutstandingAmount = outstandingPayments.reduce((sum, inv) => 
        sum + (inv.invTotal - inv.paymentTransactions.reduce((psum, p) => psum + p.amount, 0)), 0);

      return {
        pendingPayments,
        outstandingPayments,
        totalPendingAmount,
        totalOutstandingAmount,
        totalSales,
        totalOrders,
        allInvoices: invoices || []
      };
    }
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
      case "orders":
        setSelectedData(metrics?.allInvoices || []);
        setDialogTitle("Total Orders");
        break;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Pending Payments"
          value={metrics?.totalPendingAmount || 0}
          onClick={() => handleMetricClick("pending")}
        />
        <MetricsCard
          title="Outstanding Payments"
          value={metrics?.totalOutstandingAmount || 0}
          onClick={() => handleMetricClick("outstanding")}
        />
        <MetricsCard
          title="Total Sales"
          value={metrics?.totalSales || 0}
          onClick={() => handleMetricClick("sales")}
        />
        <MetricsCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          isMonetary={false}
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