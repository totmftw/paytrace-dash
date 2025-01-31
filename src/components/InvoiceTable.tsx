import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Invoice } from '@/types/types';
import { formatCurrency } from '@/lib/utils';

interface InvoiceTableProps {
  data: Invoice[];
  isLoading: boolean;
  visibleColumns: string[];
}

export function InvoiceTable({ data, isLoading, visibleColumns }: InvoiceTableProps) {
  if (isLoading) return <div>Loading...</div>;

  const formatCellValue = (invoice: Invoice, column: string) => {
    switch (column) {
      case 'customerMaster':
        return invoice.customerMaster?.custBusinessname || '';
      case 'invTotal':
      case 'invValue':
      case 'invBalanceAmount':
        const value = invoice[column as keyof Invoice];
        return typeof value === 'number' ? formatCurrency(value) : value;
      case 'invDate':
      case 'invDuedate':
        const date = invoice[column as keyof Invoice];
        return typeof date === 'string' ? new Date(date).toLocaleDateString() : date;
      default:
        const defaultValue = invoice[column as keyof Invoice];
        return defaultValue?.toString() || '';
    }
  };

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
              <TableCell key={column}>
                {formatCellValue(invoice, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}