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
// src/components/transactions/LedgerTab.tsx
const customerColumns = [
  'custBusinessname', 'custAddress', 'custGst', 'custPhonenumber'
];

const { data: selectedCustomer } = useQuery({
  queryKey: ['customer', selectedCustomerId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('customerMaster')
      .select(customerColumns.join(', '))
      .eq('id', selectedCustomerId);
    if (error) throw error;
    return data?.[0];
  },
  enabled: !!selectedCustomerId
});

// Transform data for display
const ledgerData = React.useMemo(() => {
  return (data as DatabaseLedgerEntry[]).map(entry => ({
    ...entry,
    customer: selectedCustomer,
    ...(selectedCustomer ? {
      seller: 'MKD Enterprises, Bengaluru'
    } : {})
  }));
}, [data, selectedCustomer]);

// Add PDF download button
const handlePDFDownload = () => {
  if (!ledgerData || !selectedCustomer) return;
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Date', 'Description', 'Amount', 'Balance', 'Customer', 'Seller']],
    body: ledgerData.map(row => [
      new Date(row.date).toLocaleDateString(),
      row.description,
      formatCurrency(row.amount),
      formatCurrency(row.balance),
      row.customer?.custBusinessname,
      'MKD Enterprises, Bengaluru'
    ])
  });
  doc.save(`${selectedCustomer?.custBusinessname}-ledger.pdf`);
};

return (
  <div>
    <PDFExport data={ledgerData} />
    <Button onClick={handlePDFDownload}>Download PDF</Button>
    <DataTable
      columns={columns}
      data={ledgerData}
    />
  </div>
);
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