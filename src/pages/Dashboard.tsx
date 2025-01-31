import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { SalesVsPaymentsChart } from "@/components/SalesVsPaymentsChart";
import { InvoiceTable } from "@/components/InvoiceTable";

export default function Dashboard() {
  const { selectedYear } = useFinancialYear();

  return (
    <div className="space-y-4 p-8">
      <SalesVsPaymentsChart selectedYear={selectedYear} />
      <InvoiceTable selectedYear={selectedYear} />
    </div>
  );
}