// src/components/FinancialYearSelector.tsx
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear } = useFinancialYear();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return `${year}-${year + 1}`;
  });

  return (
    <select 
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
      className="px-4 py-2 border rounded-lg bg-background text-foreground"
    >
      {years.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );
};

export const FinancialYearSelector = () => {
    const { getFYDates } = useFinancialYear();
    const { start, end } = getFYDates();
    
    return (
      <div className="flex items-center gap-4">
        <select {/* ... existing select */} />
        <span className="text-sm text-muted-foreground">
          {format(start, 'MMM dd, yyyy')} - {format(end, 'MMM dd, yyyy')}
        </span>
      </div>
    );
  };