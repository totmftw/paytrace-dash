import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import PDFExport from "@/components/buttons/PDFExport";

const columns = [
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'amount',
    header: 'Amount'
  },
  {
    accessorKey: 'balance',
    header: 'Balance'
  }
];

export default function LedgerTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { start, end } = getFYDates();

  const { data: ledgerData } = useQuery({
    queryKey: ["ledger", selectedCustomerId, selectedYear],
    queryFn: async () => {
      if (!selectedCustomerId) return [];

      const { data: invoices } = await supabase
        .from('invoiceTable')
        .select('*')
        .gte('invDate', start.toISOString())
        .lte('invDate', end.toISOString())
        .eq('invCustid', selectedCustomerId);

      const { data: payments } = await supabase
        .from('paymentTransactions')
        .select('*')
        .gte('paymentDate', start.toISOString())
        .lte('paymentDate', end.toISOString())
        .eq('invId', selectedCustomerId);

      return (invoices || []).map(inv => ({
        date: inv.invDate,
        description: `Invoice #${inv.invNumber}`,
        amount: inv.invTotal,
        balance: inv.invBalanceAmount
      })).concat(
        (payments || []).map(payment => ({
          date: payment.paymentDate,
          description: `Payment #${payment.transactionId}`,
          amount: -payment.amount,
          balance: 0 // This will be calculated cumulatively
        }))
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    enabled: !!selectedCustomerId
  });

  return (
    <div className="space-y-4">
      <CustomerSelector
        selectedCustomer={selectedCustomerId}
        onSelect={setSelectedCustomerId}
      />
      
      <DataTable
        columns={columns}
        data={ledgerData || []}
      />
      <PDFExport data={ledgerData || []} />
    </div>
  );
}