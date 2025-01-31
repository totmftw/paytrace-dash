import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function FinancialYearFilter() {
  const { setSelectedYear } = useFinancialYear();

  const { data: years } = useQuery({
    queryKey: ["financial-years"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dashboard_layouts").select("DISTINCT fy");
      if (error) throw error;
      return data.map((item) => item.fy);
    },
  });

  return (
    <Select onValueChange={setSelectedYear}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select financial year" />
      </SelectTrigger>
      <SelectContent>
        {years?.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}