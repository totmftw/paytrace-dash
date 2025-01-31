import React from 'react';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { InvoiceTable } from '@/components/InvoiceTable';
import { SalesVsPaymentsChart } from '@/components/SalesVsPaymentsChart';
import { FinancialYearSelector } from '@/components/FinancialYearSelector';

export default function Dashboard() {
  const { selectedYear } = useFinancialYear();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center gap-4">
        <FinancialYearSelector />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InvoiceTable selectedYear={selectedYear} />
        <SalesVsPaymentsChart selectedYear={selectedYear} />
      </div>
    </div>
  );
}