import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { MetricsCard } from "@/components/MetricsCard";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { BanknoteIcon, ClockIcon, ShoppingBagIcon, FileTextIcon } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { selectedYear } = useFinancialYear();
  const [pendingPopupOpen, setPendingPopupOpen] = useState(false);
  const [outstandingPopupOpen, setOutstandingPopupOpen] = useState(false);
  const [totalSalesPopupOpen, setTotalSalesPopupOpen] = useState(false);

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
      return data;
    }
  });

  const totalSales = invoices?.reduce((sum, invoice) => sum + invoice.invTotal, 0) ?? 0;
  const totalOrders = invoices?.length ?? 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="flex gap-4 mb-4">
        <FinancialYearSelector />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricsCard
          title="Total Sales"
          value={totalSales}
          iconComponent={<BanknoteIcon className="h-6 w-6" />}
        />
        <MetricsCard
          title="Total Orders"
          value={totalOrders}
          iconComponent={<FileTextIcon className="h-6 w-6" />}
        />
      </div>
      <DetailedDataTable
        title="Total Sales"
        data={invoices || []}
        onClose={() => setTotalSalesPopupOpen(false)}
      />
    </div>
  );
}