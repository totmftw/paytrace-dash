// src/components/FinancialYearSelector.tsx
import { useFinancialYear } from "../contexts/FinancialYearContext";

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear } = useFinancialYear();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
      className="p-2 border rounded bg-white text-forest-green"
    >
      {years.map(year => (
        <option key={year} value={year}>
          FY {year}-{year + 1}
        </option>
      ))}
    </select>
  );
};
