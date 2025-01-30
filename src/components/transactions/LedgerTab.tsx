import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

interface CustomerData {
  custBusinessname: string;
  custAddress: string;
  custGST: string;
  custPhone: string;
}

interface DatabaseLedgerEntry {
  transaction_date: string;
  description: string;
  invoice_number: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function LedgerTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { start, end } = getFYDates();

  const { data: customerData } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const { data, error } = await supabase
        .from('customerMaster')
        .select('custBusinessname, custAddress, custGST, custPhone')
        .eq('id', selectedCustomerId)
        .single();
      
      if (error) throw error;
      return data as CustomerData;
    },
    enabled: !!selectedCustomerId
  });

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
      return data as DatabaseLedgerEntry[];
    },
    enabled: !!selectedCustomerId
  });

  const handlePDFDownload = () => {
    if (!ledgerData || !customerData) return;
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: ledgerData.map(entry => [
        new Date(entry.transaction_date).toLocaleDateString(),
        entry.description,
        entry.debit ? formatCurrency(entry.debit) : '-',
        entry.credit ? formatCurrency(entry.credit) : '-',
        formatCurrency(entry.balance)
      ])
    });
    doc.save(`${customerData.custBusinessname}-ledger.pdf`);
  };

  const columns = [
    {
      key: 'transaction_date',
      header: 'Date',
      cell: (item: DatabaseLedgerEntry) => new Date(item.transaction_date).toLocaleDateString()
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'debit',
      header: 'Debit',
      cell: (item: DatabaseLedgerEntry) => item.debit ? formatCurrency(item.debit) : '-'
    },
    {
      key: 'credit',
      header: 'Credit',
      cell: (item: DatabaseLedgerEntry) => item.credit ? formatCurrency(item.credit) : '-'
    },
    {
      key: 'balance',
      header: 'Balance',
      cell: (item: DatabaseLedgerEntry) => formatCurrency(item.balance)
    }
  ];

  return (
    <div className="space-y-4">
      <CustomerSelector
        selectedCustomerId={selectedCustomerId}
        onSelect={setSelectedCustomerId}
      />
      {ledgerData && ledgerData.length > 0 && (
        <Button onClick={handlePDFDownload}>Download PDF</Button>
      )}
      <DataTable
        columns={columns}
        data={ledgerData || []}
      />
    </div>
  );
}