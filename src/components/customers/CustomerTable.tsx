
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from '@/types';

interface CustomerTableProps {
  data: Invoice[];
  isLoading: boolean;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business Name</TableHead>
            <TableHead>Credit Period</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.invId}>
              <TableCell>{invoice.customerMaster.custBusinessname}</TableCell>
              <TableCell>{invoice.customerMaster.custCreditperiod}</TableCell>
              <TableCell>{invoice.customerMaster.custWhatsapp}</TableCell>
              <TableCell>{invoice.customerMaster.custGST}</TableCell>
              <TableCell>{invoice.customerMaster.custStatus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

