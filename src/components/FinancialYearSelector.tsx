import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { TimeFrame } from "@/utils/financialYearUtils";

export const FinancialYearSelector = () => {
  const { 
    selectedYear, 
    setSelectedYear, 
    isLoading, 
    fyOptions, 
    getFYDates, 
    isTransitioning,
    timeFrame,
    setTimeFrame 
  } = useFinancialYear();
  
  const { start, end } = getFYDates();

  if (isLoading) return <Skeleton className="h-8 w-48" />;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-[#E6EFE9] px-3 py-1 rounded-lg">
        <span className="text-sm font-medium text-[#1B4332]">FY:</span>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px] bg-transparent border-none">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {fyOptions.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2 bg-[#E6EFE9] px-3 py-1 rounded-lg">
        <span className="text-sm font-medium text-[#1B4332]">View:</span>
        <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
          <SelectTrigger className="w-[120px] bg-transparent border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="quarter">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-[#1B4332]">
        {format(start, 'MMM dd, yyyy')} - {format(end, 'MMM dd, yyyy')}
      </div>
      {isTransitioning && <Loader2 className="h-4 w-4 animate-spin text-[#1B4332]" />}
    </div>
  );
};