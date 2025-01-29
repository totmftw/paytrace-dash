import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import InvoiceDetails from './InvoiceDetails';

interface Invoice {
  id: string;
  [key: string]: any;
}

interface EnhancedInvoiceTableProps {
  invoices: Invoice[];
}

export default function EnhancedInvoiceTable({ invoices = [] }: EnhancedInvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      {invoices.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full">
            <TableHeader />
            <tbody>
              {invoices.map((invoice) => (
                <TableRow 
                  key={invoice.id} 
                  invoice={invoice} 
                  onRowClick={handleRowClick} 
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground">No invoices available.</p>
      )}
      {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} />}
    </div>
  );
}