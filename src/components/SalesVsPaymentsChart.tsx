// src/components/SalesVsPaymentsChart.tsx
import { useFinancialYear } from "../contexts/FinancialYearContext";

export const SalesVsPaymentsChart = () => {
  const { selectedYear } = useFinancialYear();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="mb-4">Sales vs Payments</h3>
      <div>Chart implementation coming soon</div>
    </div>
  );
};
