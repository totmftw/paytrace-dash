import {
  useQuery,
  useMutation,
  UseMutationOptions,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/types/types";
import { DetailedDataTable, MetricsCard } from "@/components";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LayoutDashboard, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { selectedYear } = useFinancialYear();

  const { data: invoices } = useQuery({
    queryKey: ["invoices", selectedYear],
    queryFn: async () => {
      const [startYear, _] = selectedYear.split("-");
      const start = `${startYear}-04-01`;
      const end = `${Number(startYear) + 1}-03-31`;

      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp
          ),
          paymentTransactions (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .gte("invDate", start)
        .lte("invDate", end);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const totalSales = invoices?.reduce((sum, invoice) => sum + invoice.invTotal, 0) ?? 0;
  const totalOrders = invoices?.length ?? 0;

  // Calculate pending and outstanding payments
  const currentYear = new Date().getFullYear();
  const currentDate = new Date();

  const onNextMonth = (timeDate: number) => {
    date.setTime(timeDate);
    return date.getYear() > currentYear || (date.getYear() === currentYear && date.getMonth() >= 4);
  };

  const viewNextMonth = () => {
    return onMonth;
  };

  const onYearChangeCurrentMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(Number(e.target.value));
  };

  const onYearChange = (newYear: number) => {
    setYear(newYear);
  };

  const monthlyInvoices = invoices?.reduce((acc, invoice) => {
    const invoiceDate = new Date(invoice.invDate);
    const month = invoiceDate.getMonth();
    const year = invoiceDate.getFullYear();

    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(invoice);
    return acc;
  }, {} as Record<number, Invoice[]>);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="flex gap-4 mb-4">
        <FinancialYearSelector />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Payments */}
        <MetricsCard
          title="Pending Payments"
          value={pendingPayments}
          onClick={() => setPendingPopupOpen(true)}
          icon={<CashIcon className="h-6 w-6" />}
        />
        {/* Outstanding Payments */}
        <MetricsCard
          title="Outstanding Payments"
          value={outstandingPayments}
          onClick={() => setOutstandingPopupOpen(true)}
          icon={<ClockIcon className="h-6 w-6" />}
        />
        {/* Total Sales */}
        <MetricsCard
          title="Total Sales"
          value={totalSales}
          onClick={() => setTotalSalesPopupOpen(true)}
          icon={<ShoppingBagIcon className="h-6 w-6" />}
        />
        {/* Total Orders */}
        <MetricsCard
          title="Total Orders"
          value={totalOrders}
          onClick={() => setTotalOrdersPopupOpen(true)}
          icon={<FileTextIcon className="h-6 w-6" />}
        />
      </div>
      <DetailedDataTable
        title="Pending Payments"
        data={pendingInvoices}
        onClose={() => setPendingPopupOpen(false)}
      />
      <DetailedDataTable
        title="Outstanding Payments"
        data={outstandingInvoices}
        onClose={() => setOutstandingPopupOpen(false)}
      />
      <DetailedDataTable
        title="Total Sales"
        data={invoices}
        onClose={() => setTotalSalesPopupOpen(false)}
      />
    </div>
  );
}