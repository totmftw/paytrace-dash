import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { InvoiceDetailsPopup } from './InvoiceDetailsPopup';
import { Invoice } from '@/types/dashboard';

export function InvoiceTable() {
  const { selectedYear } = useFinancialYear();
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);

  const { data: invoices } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod
          ),
          paymentTransactions (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .gte('invDate', `${selectedYear.split('-')[0]}-04-01`)
        .lte('invDate', `${selectedYear.split('-')[1]}-03-31`);

      if (error) throw error;
      return data as Invoice[];
    },
    retry: 3,
    retryDelay: 1000,
  });

  const columns = [
    {
      accessorKey: 'invNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedInvoice(row.original.invId);
            setIsInvoiceDetailOpen(true);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          {row.original.invNumber}
        </button>
      ),
    },
    { 
      accessorKey: 'customerMaster.custBusinessname',
      header: 'Customer'
    },
    { 
      accessorKey: 'invDate',
      header: 'Invoice Date',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
    },
    { 
      accessorKey: 'invDuedate',
      header: 'Due Date',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
    },
    { 
      accessorKey: 'invTotal',
      header: 'Total Amount',
      cell: ({ getValue }) => `₹${(getValue() as number).toLocaleString()}`
    },
  ];

  const table = useReactTable({
    data: invoices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full overflow-y-auto">
      <TableUI>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.column.columnDef.header as string}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {cell.column.columnDef.cell ? 
                    cell.column.columnDef.cell({ row, getValue: () => cell.getValue() }) : 
                    cell.getValue() as string}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableUI>
      {isInvoiceDetailOpen && selectedInvoice && (
        <InvoiceDetailsPopup
          invoiceId={selectedInvoice}
          isOpen={isInvoiceDetailOpen}
          onClose={() => setIsInvoiceDetailOpen(false)}
        />
      )}
    </div>
  );
}