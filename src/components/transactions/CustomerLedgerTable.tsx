import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { LedgerEntry } from "@/types/ledger";

interface CustomerLedgerTableProps {
  onCustomerClick?: (customer: any) => void;
}

export function CustomerLedgerTable({ onCustomerClick }: CustomerLedgerTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: ledgerData = [], isLoading } = useQuery<LedgerEntry[]>({
    queryKey: ["customer-ledger", selectedCustomerId, selectedYear],
    queryFn: async () => {
      if (!selectedCustomerId) return [];

      const { data, error } = await supabase
        .rpc('get_customer_ledger_with_details', {
          p_customer_id: selectedCustomerId,
          p_start_date: start.toISOString().split('T')[0],
          p_end_date: end.toISOString().split('T')[0]
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCustomerId,
  });

  const columns = [
    {
      key: "transaction_date",
      header: "Date",
      cell: (row: LedgerEntry) => new Date(row.transaction_date).toLocaleDateString()
    },
    {
      key: "transaction_type",
      header: "Type"
    },
    {
      key: "reference_number",
      header: "Reference"
    },
    {
      key: "debit_amount",
      header: "Debit",
      cell: (row: LedgerEntry) => row.debit.toFixed(2)
    },
    {
      key: "credit_amount",
      header: "Credit",
      cell: (row: LedgerEntry) => row.credit.toFixed(2)
    },
    {
      key: "balance",
      header: "Balance",
      cell: (row: LedgerEntry) => row.balance.toFixed(2)
    }
  ];

  return (
    <Card className="bg-[#E8F3E8]">
      <CardHeader>
        <CardTitle className="text-[#1B4D3E]">Customer Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CustomerSelector
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
          />
          <div className="rounded-md border border-[#4A7862]">
            <DataTable
              columns={columns}
              data={ledgerData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}