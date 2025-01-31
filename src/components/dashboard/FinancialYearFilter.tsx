// src/components/Dashboard/FinancialYearFilter.tsx
import { Select } from '@/components/ui/select';
import { useFinancialYear } from '@/contexts/FinancialYearContext';

export function FinancialYearFilter() {
  const { selectedYear, getFYDates, setSelectedYear } = useFinancialYear();

  const yearsList = Array.from({ length: 10 }, (_, i) => {
    const thisYear = new Date().getFullYear() - i - 1;
    return `${thisYear}-${thisYear + 1}`;
  });

  return (
    <Select value={selectedYear} onValueChange={setSelectedYear}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        {yearsList.map((year) => (
          <SelectItem key={year} value={year}>
            FY {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}