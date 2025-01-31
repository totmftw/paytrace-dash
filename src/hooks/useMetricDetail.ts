import { useQuery } from "@tanstack/react-query";
import { fetchInvoiceMetrics } from "@/apis/invoiceApi";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export const useMetricDetail = () => {
  const { startDate, endDate } = useFinancialYear();
  const { data: metrics } = useQuery({
    queryKey: ["invoice-metrics", startDate, endDate],
    queryFn: () => fetchInvoiceMetrics({ 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    }),
  });
  return metrics;
};