import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export function FinancialYearSelector() {
  const { selectedYear, setSelectedYear } = useFinancialYear();

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  };

  return (
    <Select value={selectedYear} onValueChange={setSelectedYear}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        {generateYearOptions().map((year) => (
          <SelectItem key={year} value={year}>
            FY {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}