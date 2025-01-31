import { useQuery } from "@tanstack/react-query";
import { fetchInvoiceMetrics } from "@/apis/invoiceApi";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export const useMetricDetail = () => {
  const { selectedYear } = useFinancialYear();
  const [startYear, endYear] = selectedYear.split('-');
  const startDate = `${startYear}-04-01`;
  const endDate = `${endYear}-03-31`;

  return useQuery({
    queryKey: ["invoice-metrics", startDate, endDate],
    queryFn: () => fetchInvoiceMetrics(startDate, endDate),
  });
};