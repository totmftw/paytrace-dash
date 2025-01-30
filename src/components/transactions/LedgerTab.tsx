import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { CustomerSelector } from './CustomerSelector';
import { DataTable } from '@/components/ui/data-table';

const columns = [
  {
    key: 'date',
    header: 'Date',
    cell: (item: { date: string }) => new Date(item.date).toLocaleDateString()
  },
  {
    key: 'description',
    header: 'Description'
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (item: { amount: number }) => item.amount.toFixed(2)
  },
  {
    key: 'balance',
    header: 'Balance',
    cell: (item: { balance: number }) => item.balance.toFixed(2)
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
      return data;
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