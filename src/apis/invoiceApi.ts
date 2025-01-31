import { supabase } from "@/integrations/supabase/client";

interface InvoiceMetricParams {
  startDate: string;
  endDate: string;
}

export const fetchInvoiceMetrics = async ({
  startDate,
  endDate,
}: InvoiceMetricParams) => {
  const { data, error } = await supabase
    .from("invoiceTable")
    .select("*")
    .gte("invDate", startDate)
    .lte("invDate", endDate);

  if (error) throw error;
  return data;
};