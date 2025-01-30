import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import { columns, LedgerEntry } from "./table-columns";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

interface CustomerLedgerTableProps {
  onCustomerClick?: (customer: any) => void;
}

export function CustomerLedgerTable({ onCustomerClick }: CustomerLedgerTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { selectedYear } = useFinancialYear();

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
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

  const { data: ledgerData, isLoading: isLoadingLedger } = useQuery<LedgerEntry[]>({
    queryKey: ["customer-ledger", selectedCustomerId, selectedYear],
    queryFn: async () => {
      if (!selectedCustomerId) return [];

      const year = parseInt(selectedYear.split('-')[0]);
      const startDate = new Date(year, 3, 1).toISOString(); // April 1st
      const endDate = new Date(year + 1, 2, 31).toISOString(); // March 31st

      const { data, error } = await supabase
        .rpc('get_customer_ledger', {
          p_customer_id: selectedCustomerId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCustomerId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CustomerSelector
            customers={customers || []}
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
            isLoading={isLoadingCustomers}
          />
          <DataTable
            columns={columns}
            data={ledgerData || []}
            isLoading={isLoadingLedger}
          />
        </div>
      </CardContent>
    </Card>
  );
}