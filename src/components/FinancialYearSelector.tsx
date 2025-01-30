import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "./ui/skeleton";

export const FinancialYearSelector = () => {
  const { selectedYear, setSelectedYear, isLoading, fyOptions, getFYDates, isTransitioning } = useFinancialYear();
  const { start, end } = getFYDates();

  if (isLoading) return <Skeleton className="h-8 w-48" />;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-[#E6EFE9] px-3 py-1 rounded-lg">
        <span className="text-sm font-medium text-[#1B4332]">FY:</span>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-transparent outline-none disabled:opacity-50 text-[#1B4332]"
          disabled={isTransitioning}
        >
          {fyOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="text-sm text-[#1B4332]">
        {format(start, 'MMM dd, yyyy')} - {format(end, 'MMM dd, yyyy')}
      </div>
      {isTransitioning && <Loader2 className="h-4 w-4 animate-spin text-[#1B4332]" />}
    </div>
  );
};