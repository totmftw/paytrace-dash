import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { MetricsCard } from "@/components/MetricsCard";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { BanknoteIcon, FileTextIcon } from "lucide-react";
import { DashboardProps } from "@/types/dashboard";

export default function Dashboard({ year }: DashboardProps) {
  const { selectedYear } = useFinancialYear();

  const { data: invoices } = useQuery({
    queryKey: ["invoices", selectedYear],
    queryFn: async () => {
      const [startYear, _] = selectedYear.split("-");
      const startDate = `${startYear}-04-01`;
      const endDate = `${Number(startYear) + 1}-03-31`;

      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp,
            custGST,
            custPhone
          ),
          paymentTransactions (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

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
          icon={<BanknoteIcon className="h-6 w-6" />}
          isMonetary={true}
        />
        <MetricsCard
          title="Total Orders"
          value={totalOrders}
          icon={<FileTextIcon className="h-6 w-6" />}
          isMonetary={false}
        />
      </div>
      <DetailedDataTable
        title="Total Sales"
        data={invoices || []}
        onClose={() => {}}
      />
    </div>
  );
}