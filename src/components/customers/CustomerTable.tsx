import React from 'react';
import type { CustomerTableProps } from '@/types/types';

export const CustomerTable: React.FC<CustomerTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Business Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credit Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WhatsApp
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((invoice) => (
            <tr key={invoice.invId}>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.customerMaster.custBusinessname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.customerMaster.custCreditperiod}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {invoice.customerMaster.custWhatsapp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};