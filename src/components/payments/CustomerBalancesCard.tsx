import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PaymentLedgerDialog } from "./PaymentLedgerDialog";
import { balanceColumns } from "./table-columns";

export function CustomerBalancesCard() {
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    whatsapp: number;
  } | null>(null);

  const { data: ledgerBalances, isLoading } = useQuery({
    queryKey: ["ledger-balances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_ledger_balance')
        .select('*')
        .order('custBusinessname');

      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-black">Customer Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={balanceColumns(setSelectedCustomer)}
            data={ledgerBalances || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {selectedCustomer && (
        <PaymentLedgerDialog
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          whatsappNumber={selectedCustomer.whatsapp}
        />
      )}
    </>
  );
}