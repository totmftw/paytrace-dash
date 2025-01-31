import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types";

interface Options {
  startDate: string;
  endDate: string;
  selectQuery?: string;
}

export const useInvoiceData = ({ startDate, endDate, selectQuery = '*' }: Options) => {
  return useQuery({
    queryKey: ['invoices', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(selectQuery)
        .gte('invDate', startDate)
        .lte('invDate', endDate);

      if (error) throw error;
      return data as Invoice[];
    },
  });
};

