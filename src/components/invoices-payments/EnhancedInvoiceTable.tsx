<>
tsx


import React, { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import InvoiceDetails from './InvoiceDetails';

const EnhancedInvoiceTable = ({ invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div>
      <h1>Invoices</h1>
      <table>
        <TableHeader />
        <tbody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} invoice={invoice} onRowClick={handleRowClick} />
          ))}
        </tbody>
      </table>
      {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} />}
    </div>
  );
};

export default EnhancedInvoiceTable;