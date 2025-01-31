import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Invoice } from '@/types/types';
import { formatCurrency } from '@/lib/utils';
// src/components/InvoiceTable.tsx
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// ... (rest of the implementation remains the same)

interface InvoiceTableProps {
  data: Invoice[];
  isLoading: boolean;
  visibleColumns: string[];
}

export function InvoiceTable({ data, isLoading, visibleColumns }: InvoiceTableProps) {
  if (isLoading) return <div>Loading...</div>;

  const columns = {
    invNumber: "Invoice Number",
    customerBusinessname: "Customer",
    invTotal: "Total Amount",
    invDate: "Invoice Date",
    invDuedate: "Due Date",
    status: "Status"
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Object.keys(columns).map((column) => (
            <TableHead key={column}>{columns[column]}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((invoice) => (
          <TableRow key={invoice.invId}>
            <TableCell>{invoice.invNumber}</TableCell>
            <TableCell>{invoice.customerMaster?.custBusinessname}</TableCell>
            <TableCell>{formatCurrency(invoice.invTotal)}</TableCell>
            <TableCell>{new Date(invoice.invDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(invoice.invDuedate).toLocaleDateString()}</TableCell>
            <TableCell>
              {new Date(invoice.invDuedate) < new Date()
                ? "Overdue"
                : "Pending"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}