import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { DataTable } from "@/components/ui/data-table";

interface Payment {
  paymentId: number;
  invId: number;
  transactionId: string;
  paymentMode: string;
  chequeNumber?: string;
  bankName?: string;
  paymentDate: string;
  amount: number;
  remarks?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
}

export default function PaymentTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: payments } = useQuery({
    queryKey: ['payments', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paymentTransactions')
        .select('*')
        .gte('paymentDate', start.toISOString())
        .lte('paymentDate', end.toISOString());

      if (error) throw error;
      return data as Payment[];
    }
  });

  const columns = [
    {
      accessorKey: 'paymentDate',
      header: 'Date',
      cell: (row: any) => new Date(row.getValue('paymentDate')).toLocaleDateString()
    },
    {
      accessorKey: 'transactionId',
      header: 'Transaction ID'
    },
    {
      accessorKey: 'paymentMode',
      header: 'Payment Mode'
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (row: any) => row.getValue('amount').toFixed(2)
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={payments || []}
      />
    </div>
  );
}