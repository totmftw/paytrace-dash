import React from 'react';

const TableRow = ({ invoice, onRowClick }) => (
  <tr onClick={() => onRowClick(invoice)}>
    <td>{invoice.id}</td>
    <td>{invoice.customer}</td>
    <td>{invoice.amount}</td>
    <td>{invoice.status}</td>
  </tr>
);

export default TableRow;