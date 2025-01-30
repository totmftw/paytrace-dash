import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import { columns, LedgerEntry } from "./table-columns";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";

interface CustomerLedgerTableProps {
  onCustomerClick?: (customer: any) => void;
}

export function CustomerLedgerTable({ onCustomerClick }: CustomerLedgerTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("id, custBusinessname, custWhatsapp")
        .order("custBusinessname");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: ledgerData = [], isLoading: isLoadingLedger } = useQuery<LedgerEntry[]>({
    queryKey: ["customer-ledger", selectedCustomerId, selectedYear],
    queryFn: async () => {
      if (!selectedCustomerId) return [];

      const { data, error } = await supabase
        .rpc('get_customer_ledger', {
          p_customer_id: selectedCustomerId,
          p_start_date: start.toISOString(),
          p_end_date: end.toISOString()
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCustomerId,
  });

  return (
    <Card className="bg-[#E8F3E8]"> {/* Pastel moss green background */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[#1B4D3E]">Customer Ledger</CardTitle> {/* Dark pastel forest green text */}
        <FinancialYearSelector />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CustomerSelector
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
            isLoading={isLoadingCustomers}
          />
          <div className="rounded-md border border-[#4A7862]"> {/* Dark green border */}
            <DataTable
              columns={columns}
              data={ledgerData}
              isLoading={isLoadingLedger}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}