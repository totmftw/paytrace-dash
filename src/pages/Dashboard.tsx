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
// src/pages/Dashboard.tsx
import { useAuth } from '../contexts/AuthContext';
import { useFinancialYear } from '../contexts/FinancialYearContext';
import { FinancialYearSelector } from '../components/FinancialYearSelector';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();

  // Add a console.log to debug
  console.log('Dashboard rendering:', { user, selectedYear });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <FinancialYearSelector />
        </div>
        <div className="grid gap-6">
          <MetricsGrid />
          {/* Add other components here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
// src/pages/Dashboard.tsx
import { useAuth } from '../contexts/AuthContext';
import { useFinancialYear } from '../contexts/FinancialYearContext';
import { FinancialYearSelector } from '../components/FinancialYearSelector';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();

  if (!user) return null;

  return (
    <div className="p-4">
      <div className="mb-4">
        <FinancialYearSelector />
      </div>
      <div>
        <h1>Welcome to Dashboard</h1>
        {/* Add your dashboard components here */}
      </div>
    </div>
  );
};



export default Dashboard;
