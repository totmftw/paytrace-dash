// src/components/dashboard/MetricsGrid.tsx
import { useQuery } from '@tanstack/react-query';
import { useFinancialYear } from '../../contexts/FinancialYearContext';

export const MetricsGrid = () => {
  const { selectedYear } = useFinancialYear();

  const { data: metrics, isLoading } = useQuery(
    ['metrics', selectedYear],
    async () => {
      // Placeholder data
      return {
        totalSales: 0,
        totalOrders: 0,
        pendingPayments: 0,
        completedPayments: 0,
      };
    }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
        <p className="text-2xl font-bold mt-2">{metrics?.totalSales || 0}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
        <p className="text-2xl font-bold mt-2">{metrics?.totalOrders || 0}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
        <p className="text-2xl font-bold mt-2">{metrics?.pendingPayments || 0}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Completed Payments</h3>
        <p className="text-2xl font-bold mt-2">{metrics?.completedPayments || 0}</p>
      </div>
    </div>
  );
};
