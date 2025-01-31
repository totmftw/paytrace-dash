import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ColumnDef, useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            amount,
            paymentDate,
            transactionId,
            paymentMode,
            chequeNumber,
            bankName,
            remarks
          )
        `)
        .gte('invDate', `${selectedYear.split('-')[0]}-04-01`)
        .lte('invDate', `${selectedYear.split('-')[1]}-03-31`);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const columns: ColumnDef<Invoice>[] = [
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
          {row.getValue('invNumber')}
        </button>
      ),
    },
    {
      accessorKey: 'customerMaster.custBusinessname',
      header: 'Customer',
    },
    {
      accessorKey: 'invDate',
      header: 'Invoice Date',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? new Date(value).toLocaleDateString() : '';
      },
    },
    {
      accessorKey: 'invDuedate',
      header: 'Due Date',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? new Date(value).toLocaleDateString() : '';
      },
    },
    {
      accessorKey: 'invTotal',
      header: 'Total Amount',
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? `₹${value.toLocaleString()}` : '';
      },
    },
  ];

  const table = useReactTable({
    data: invoices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full overflow-y-auto">
      <Table>
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
                    cell.column.columnDef.cell(cell.getContext()) : 
                    String(cell.getValue())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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