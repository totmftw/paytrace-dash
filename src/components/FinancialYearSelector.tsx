// src/components/financialYear/FinancialYearSelector.tsx
import { Select } from "@/components/ui/select";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export const FinancialYearSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedYear, availableYears, setSelectedYear } = useFinancialYear();

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