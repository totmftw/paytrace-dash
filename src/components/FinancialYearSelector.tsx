import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface FinancialYear {
  financial_year: string;
}

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear } = useFinancialYear();
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data, error } = await supabase
          .from("financial_year_ranges")
          .select("financial_year");

        if (error) throw error;
        if (data) {
          setAvailableYears(data.map((year) => year.financial_year || ''));
        }
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };

    fetchYears();
  }, []);

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