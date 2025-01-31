import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { MetricsCard } from "./MetricsCard";
import type { Invoice } from "@/types/types";

interface PaymentMetricsData {
  pendingPayments: Invoice[];
  outstandingPayments: Invoice[];
  totalPendingAmount: number;
  totalOutstandingAmount: number;
  totalSales: number;
  totalOrders: number;
  allInvoices: Invoice[];
}

export function PaymentMetrics() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const [selectedData, setSelectedData] = useState<Invoice[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const { data: metrics } = useQuery<PaymentMetricsData>({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      const { start, end } = getFYDates();
      
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          invId,
          invNumber,
          invDate,
          invTotal,
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
        .gte("invDate", start.toISOString())
        .lte("invDate", end.toISOString());

      if (error) throw error;

      const invoices = data as Invoice[];
      const today = new Date();

      const totalSales = invoices.reduce((sum, inv) => sum + inv.invTotal, 0);
      const totalOrders = invoices.length;

      const pendingPayments = invoices.filter(inv => {
        const dueDate = new Date(inv.invDate);
        dueDate.setDate(dueDate.getDate() + (inv.customerMaster?.custCreditperiod || 0));
        return dueDate > today;
      });

      const outstandingPayments = invoices.filter(inv => {
        const dueDate = new Date(inv.invDate);
        dueDate.setDate(dueDate.getDate() + (inv.customerMaster?.custCreditperiod || 0));
        return dueDate < today;
      });

      const totalPendingAmount = pendingPayments.reduce((sum, inv) => 
        sum + (inv.invTotal - (inv.paymentTransactions?.reduce((psum, p) => psum + p.amount, 0) || 0)), 0);

      const totalOutstandingAmount = outstandingPayments.reduce((sum, inv) => 
        sum + (inv.invTotal - (inv.paymentTransactions?.reduce((psum, p) => psum + p.amount, 0) || 0)), 0);

      return {
        pendingPayments,
        outstandingPayments,
        totalPendingAmount,
        totalOutstandingAmount,
        totalSales,
        totalOrders,
        allInvoices: invoices
      };
    }
  });

  const handleMetricClick = (type: string) => {
    if (!metrics) return;
    
    switch (type) {
      case "pending":
        setSelectedData(metrics.pendingPayments);
        setDialogTitle("Pending Payments");
        break;
      case "outstanding":
        setSelectedData(metrics.outstandingPayments);
        setDialogTitle("Outstanding Payments");
        break;
      case "sales":
        setSelectedData(metrics.allInvoices);
        setDialogTitle("Total Sales");
        break;
      case "orders":
        setSelectedData(metrics.allInvoices);
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