import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear } = useFinancialYear();

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => 
    `${currentYear - 2 + i}-${currentYear - 1 + i + 1}`
  );

  return (
    <Select value={selectedYear} onValueChange={setSelectedYear}>
      <SelectTrigger>
        <SelectValue placeholder="Select Financial Year" />
      </SelectTrigger>
      <SelectContent>
        {availableYears.map(year => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};