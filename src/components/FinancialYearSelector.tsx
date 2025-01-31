import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear } = useFinancialYear();
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const { data: fyData, isLoading } = useQuery({
    queryKey: ["financial-year-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_year_ranges")
        .select("financial_year")
        .order("financial_year", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (fyData && fyData.length > 0) {
      const years = fyData.map((year) => year.financial_year || "");
      setAvailableYears(years);
    }
  }, [fyData]);

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg">
      <span className="text-sm font-semibold">Financial Year:</span>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="bg-gray-200 border-none focus:ring-0 text-sm"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};