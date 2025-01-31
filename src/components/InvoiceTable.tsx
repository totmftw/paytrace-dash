import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice } from '@/types/dashboard';
import { formatCurrency } from '@/lib/utils';

interface InvoiceTableProps {
  data: Invoice[];
  isLoading: boolean;
  visibleColumns: string[];
}

export function InvoiceTable({ data, isLoading, visibleColumns }: InvoiceTableProps) {
  if (isLoading) return <div>Loading...</div>;

  const formatCellValue = (invoice: Invoice, column: string) => {
    const value = invoice[column as keyof Invoice];
    
    if (column.toLowerCase().includes('amount') || column.toLowerCase().includes('total')) {
      return typeof value === 'number' ? formatCurrency(value) : value;
    }
    
    if (column.includes('date') && typeof value === 'string') {
      return new Date(value).toLocaleDateString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return value;
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