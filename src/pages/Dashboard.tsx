// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { InvoiceTable } from "@/components/InvoiceTable";
import { SalesVsPaymentsChart } from "@/components/SalesVsPaymentsChart";

const Dashboard = () => {
  const { selectedYear } = useFinancialYear();

  return (
    <div className="p-4">
      <div className="mb-4">
        <FinancialYearSelector />
      </div>
      
      <div className="grid gap-4">
        {/* Simple static layout first */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricsGrid />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InvoiceTable />
          </div>
          <div>
            <SalesVsPaymentsChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
