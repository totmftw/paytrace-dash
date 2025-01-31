import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useColumnConfig } from "@/contexts/ColumnConfigContext";
import { SalesVsPaymentsChart } from "@/components/SalesVsPaymentsChart";
import { InvoiceTable } from "@/components/InvoiceTable";
import { useInvoiceData } from "@/hooks/useInvoiceData";

export default function Dashboard() {
  const { selectedYear } = useFinancialYear();
  const { visibleColumns } = useColumnConfig();
  const { data: invoices, isLoading } = useInvoiceData(selectedYear);

  return (
    <div className="space-y-4 p-8">
      <SalesVsPaymentsChart selectedYear={selectedYear} />
      <InvoiceTable 
        data={invoices || []} 
        isLoading={isLoading}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}