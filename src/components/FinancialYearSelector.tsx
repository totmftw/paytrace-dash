import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useEffect, useState } from "react";

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear, availableYears, loading } = useFinancialYear();
  const [dirtyAvailableYears, setDirtyAvailableYears] = useState([]);

  useEffect(() => {
    if (!loading && availableYears.length > 0) {
      setDirtyAvailableYears(availableYears);
    }
  }, [availableYears, loading]);

  return (
    <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg">
      <span className="text-sm font-semibold">Financial Year:</span>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="bg-gray-200 border-none focus:ring-0 text-sm"
      >
        {dirtyAvailableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
  useEffect(() => {
    if (fyData && fyData.length > 0) {
      const years = fyData.map((year) => year.financial_year || "");
      setAvailableYears(years);
      
      // Set default fiscal year
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      const fiscalYear = currentMonth > fiscalYearStartMonth
        ? currentYear.toString()
        : (currentYear - 1).toString();
      
      if (!selectedYear) {
        setSelectedYear(fiscalYear);
      }
    }
  }, [fyData, setSelectedYear, selectedYear]);

  if (isLoading) return null;

 