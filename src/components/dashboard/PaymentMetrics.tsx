import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { MetricsCard } from "@/components/MetricsCard";

interface PaymentMetricsData {
  pendingAmount: number;
  outstandingAmount: number;
  totalSales: number;
  totalOrders: number;
}

const PaymentMetrics = () => {
  const { selectedYear, startDate, endDate } = useFinancialYear();
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
        .gte("invDate", startDate.toISOString())
        .lte("invDate", endDate.toISOString());

      if (error) throw error;

      const totalSales = invoices.reduce(
        (sum, inv) => sum + inv.invTotal,
        0
      );
      const totalOrders = invoices.length;

      const today = new Date();
      const pending = invoices.filter(
        (inv) =>
          new Date(inv.invDuedate) > today &&
          inv.paymentTransactions.reduce((sum, p) => sum + p.amount, 0) < inv.invTotal
      );
      const outstanding = invoices.filter(
        (inv) =>
          new Date(inv.invDuedate) < today &&
          inv.paymentTransactions.reduce((sum, p) => sum + p.amount, 0) < inv.invTotal
      );

      return {
        pendingAmount: pending.reduce((sum, inv) => sum + inv.invTotal, 0) -
          pending.reduce((sum, inv) => sum + inv.paymentTransactions.reduce((s, p) => s + p.amount, 0), 0),
        outstandingAmount: outstanding.reduce((sum, inv) => sum + inv.invTotal, 0) -
          outstanding.reduce((sum, inv) => sum + inv.paymentTransactions.reduce((s, p) => s + p.amount, 0), 0),
        totalSales,
        totalOrders,
      };
    },
  });

  const handleMetricClick = (type: string) => {
    if (!data) return;

    switch (type) {
      case "pending":
        setSelectedData(pending);
        setDialogTitle("Pending Payments");
        break;
      case "outstanding":
        setSelectedData(outstanding);
        setDialogTitle("Outstanding Payments");
        break;
      case "sales":
        setSelectedData(allInvoices);
        setDialogTitle("Total Sales");
        break;
      case "orders":
        setSelectedData(allInvoices);
        setDialogTitle("Total Orders");
        break;
    }
  };

  return (
    <>
      <div className="metrics-grid">
        <MetricsCard
          title="Pending Payments"
          amount={data?.pendingAmount || 0}
          onClick={() => handleMetricClick("pending")}
        />
        <MetricsCard
          title="Outstanding Payments"
          amount={data?.outstandingAmount || 0}
          onClick={() => handleMetricClick("outstanding")}
        />
        <MetricsCard
          title="Total Sales"
          amount={data?.totalSales || 0}
          onClick={() => handleMetricClick("sales")}
        />
        <MetricsCard
          title="Total Orders"
          count={data?.totalOrders || 0}
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
};

export default PaymentMetrics;