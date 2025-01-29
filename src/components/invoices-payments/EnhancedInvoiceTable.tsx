import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import InvoiceDetails from './InvoiceDetails';

const EnhancedInvoiceTable = ({ invoices = [] }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div>
      <h1>Invoices</h1>
      {invoices.length > 0 ? (
        <table>
          <TableHeader />
          <tbody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} invoice={invoice} onRowClick={handleRowClick} />
            ))}
          </tbody>
        </table>
      ) : (
        <p>No invoices available.</p>
      )}
      {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} />}
    </div>
  );
};

export default EnhancedInvoiceTable;