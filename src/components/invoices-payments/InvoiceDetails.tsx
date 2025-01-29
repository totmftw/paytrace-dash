import React from 'react';

const InvoiceDetails = ({ invoice }) => (
  <div>
    <h2>Invoice Details</h2>
    <p>ID: {invoice.id}</p>
    <p>Customer: {invoice.customer}</p>
    <p>Amount: {invoice.amount}</p>
    <p>Status: {invoice.status}</p>
  </div>
);

export default InvoiceDetails;