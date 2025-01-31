// src/components/transactions/InvoiceTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InvoiceTableProps {
  data: Invoice[];
  isLoading: boolean;
  visibleColumns: string[];
}

export function InvoiceTable({ data, isLoading, visibleColumns }: InvoiceTableProps) {
  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((invoice) => (
          <TableRow key={invoice.invId}>
            {visibleColumns.map((column) => (
              <TableCell key={column}>{invoice[column]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}