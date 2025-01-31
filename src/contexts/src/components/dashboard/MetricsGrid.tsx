// src/components/dashboard/MetricsGrid.tsx
import { useQuery } from "@tanstack/react-query";
import { useFinancialYear } from "../../contexts/FinancialYearContext";

export const MetricsGrid = () => {
  const { selectedYear } = useFinancialYear();

  const { data: metrics, isLoading } = useQuery(
    ['metrics', selectedYear],
    async () => {
      return {
        pendingPayments: 0,
        outstandingPayments: 0,
        totalSales: 0,
        totalOrders: 0
      };
    }
  );

  if (isLoading) return <div>Loading metrics...</div>;

  return (
    <>
      <div className="bg-white p-4 rounded shadow">
        <h3>Pending Payments</h3>
        <p className="text-2xl">{metrics?.pendingPayments || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Outstanding Payments</h3>
        <p className="text-2xl">{metrics?.outstandingPayments || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Total Sales</h3>
        <p className="text-2xl">{metrics?.totalSales || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Total Orders</h3>
        <p className="text-2xl">{metrics?.totalOrders || 0}</p>
      </div>
    </>
  );
};
