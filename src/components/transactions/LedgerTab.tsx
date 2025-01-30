// src/pages/Transactions/LedgerTab.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import { calculateRunningBalance } from "@/utils/ledgerUtils";
import { PDFExport } from "../buttons/PDFExport";

export default function LedgerTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { start, end } = getFYDates();

  const { data: ledgerData } = useQuery({
    queryKey: ["ledger", selectedCustomerId, selectedYear],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from('invoiceTable')
        .select('*')
        .gte('invDate', start.toISOString())
        .lte('invDate', end.toISOString())
        .eq('customer_id', selectedCustomerId);

      const { data: payments } = await supabase
        .from('paymentTransactions')
        .select('*')
        .gte('paymentDate', start.toISOString())
        .lte('paymentDate', end.toISOString())
        .eq('customer_id', selectedCustomerId);

      return calculateRunningBalance([...invoices, ...payments]);
    },
    enabled: !!selectedCustomerId,
  });

  return (
    <div className="space-y-4">
      <CustomerSelector
        customers={[]}
        selectedCustomerId={selectedCustomerId}
        onSelect={setSelectedCustomerId}
      />
      
      <DataTable
        columns={columns}
        data={ledgerData || []}
      />
      <PDFExport data={ledgerData} />
    </div>
  );
}