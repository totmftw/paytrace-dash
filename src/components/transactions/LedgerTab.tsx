import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { CustomerSelector } from './CustomerSelector';
import { DataTable } from '@/components/ui/data-table';

interface LedgerEntry {
  date: string;
  description: string;
  amount: number;
  balance: number;
}

interface DatabaseLedgerEntry {
  transaction_date: string;
  description: string;
  invoice_number: string;
  debit: number;
  credit: number;
  balance: number;
}

const columns = [
  {
    key: 'date',
    header: 'Date',
    cell: (row: LedgerEntry) => new Date(row.date).toLocaleDateString()
  },
  {
    key: 'description',
    header: 'Description'
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row: LedgerEntry) => row.amount.toFixed(2)
  },
  {
    key: 'balance',
    header: 'Balance',
    cell: (row: LedgerEntry) => row.balance.toFixed(2)
  }
];

export default function LedgerTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { start, end } = getFYDates();

  const { data: ledgerData } = useQuery({
    queryKey: ['ledger', selectedCustomerId, selectedYear],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const { data, error } = await supabase.rpc('get_customer_ledger', {
        p_customer_id: selectedCustomerId,
        p_start_date: start.toISOString(),
        p_end_date: end.toISOString()
      });
      if (error) throw error;
      
      // Transform the database response to match our LedgerEntry interface
      return (data as DatabaseLedgerEntry[]).map(entry => ({
        date: entry.transaction_date,
        description: `${entry.description}${entry.invoice_number ? ` - ${entry.invoice_number}` : ''}`,
        amount: entry.debit || -entry.credit, // Positive for debit, negative for credit
        balance: entry.balance
      }));
    },
    enabled: !!selectedCustomerId
  });

  return (
    <div className="space-y-4">
      <CustomerSelector
        selectedCustomerId={selectedCustomerId}
        onSelect={setSelectedCustomerId}
      />
      <DataTable
        columns={columns}
        data={ledgerData || []}
      />
    </div>
  );
}