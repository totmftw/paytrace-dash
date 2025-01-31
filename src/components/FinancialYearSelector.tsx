import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentFinancialYear } from "@/utils/financialYearUtils";

export function FinancialYearSelector() {
  const { selectedYear, setSelectedYear } = useFinancialYear();

  const { data: fyData } = useQuery({
    queryKey: ["financial-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_year_ranges")
        .select("*")
        .order("financial_year", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Financial Year:</span>
      <Select
        value={selectedYear || getCurrentFinancialYear()}
        onValueChange={setSelectedYear}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {fyData?.map((fy) => (
            <SelectItem key={fy.financial_year} value={fy.financial_year}>
              {fy.financial_year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}