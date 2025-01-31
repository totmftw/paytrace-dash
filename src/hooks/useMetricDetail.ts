import { useQuery } from "@tanstack/react-query";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { fetchInvoiceMetrics } from "@/apis/invoiceApi";

export const useMetricDetail = () => {
  const { startDate: start, endDate: end } = useFinancialYear();
  const { data: metrics } = useQuery({
    queryKey: ["invoice-metrics", start, end],
    queryFn: () => fetchInvoiceMetrics({ startDate: start, endDate: end }),
  });
  return metrics;
};