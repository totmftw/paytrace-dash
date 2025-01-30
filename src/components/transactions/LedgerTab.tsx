import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { CustomerSelector } from './CustomerSelector';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';

interface LedgerEntry {
  transaction_date: string;
  description: string;
  invoice_number: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CustomerData {
  custBusinessname: string;
  custAddress: string;
  custGst: string;
  custPhonenumber: string;
}

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
      return data as LedgerEntry[];
    },
    enabled: !!selectedCustomerId
  });

  const { data: customerData } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const { data, error } = await supabase
        .from('customerMaster')
        .select('custBusinessname, custAddress, custGst, custPhonenumber')
        .eq('id', selectedCustomerId)
        .single();
      if (error) throw error;
      return data as CustomerData;
    },
    enabled: !!selectedCustomerId
  });

  const handlePDFDownload = () => {
    if (!ledgerData || !customerData) return;
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: ledgerData.map(row => [
        new Date(row.transaction_date).toLocaleDateString(),
        row.description,
        row.debit ? formatCurrency(row.debit) : '-',
        row.credit ? formatCurrency(row.credit) : '-',
        formatCurrency(row.balance)
      ])
    });
    doc.save(`${customerData.custBusinessname}-ledger.pdf`);
  };

  const columns = [
    {
      key: 'transaction_date',
      header: 'Date',
      cell: (row: LedgerEntry) => new Date(row.transaction_date).toLocaleDateString()
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'debit',
      header: 'Debit',
      cell: (row: LedgerEntry) => row.debit ? formatCurrency(row.debit) : '-'
    },
    {
      key: 'credit',
      header: 'Credit',
      cell: (row: LedgerEntry) => row.credit ? formatCurrency(row.credit) : '-'
    },
    {
      key: 'balance',
      header: 'Balance',
      cell: (row: LedgerEntry) => formatCurrency(row.balance)
    }
  ];

  return (
    <div className="space-y-4">
      <CustomerSelector
        selectedCustomerId={selectedCustomerId}
        onSelect={setSelectedCustomerId}
      />
      <div className="flex gap-2">
        <Button onClick={handlePDFDownload} variant="outline">
          Download PDF
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={ledgerData || []}
      />
    </div>
  );
}