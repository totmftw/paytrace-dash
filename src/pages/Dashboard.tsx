// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useFinancialYear } from '../contexts/FinancialYearContext';
import { useAuth } from '../contexts/AuthContext';
import { FinancialYearSelector } from '../components/FinancialYearSelector';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { InvoiceTable } from '../components/InvoiceTable';
import { SalesVsPaymentsChart } from '../components/SalesVsPaymentsChart';
import { LayoutConfig } from '../components/dashboard/LayoutConfig';
import { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <FinancialYearSelector />
        {user && user.role === 'admin' && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-leaf-green text-forest-green px-4 py-2 rounded"
          >
            {isEditing ? 'Save Layout' : 'Configure Layout'}
          </button>
        )}
      </div>
      
      <div className="grid gap-4">
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

      {isEditing && <LayoutConfig layout={layout} />}
    </div>
  );
};

export default Dashboard;
