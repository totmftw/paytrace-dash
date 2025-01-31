// src/hooks/useInvoiceQuery.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/types/types";

interface UseInvoiceQueryProps {
  year: string;
  options?: Parameters<typeof useQuery>[1];
}

export async function fetchInvoicesForYear(year: string): Promise<Invoice[]> {
  const [startYear] = year.split('-');
  const { data, error } = await supabase
    .from("invoiceTable")
    .select(`
      *,
      customerMaster!invoiceTable_invCustid_fkey (
        custBusinessname
      ),
      paymentTransactions (
        amount
      )
    `)
    .gte("invDate", `${startYear}-04-01`)
    .lte("invDate", `${parseInt(startYear) + 1}-03-31`);

  if (error) throw error;
  return data ?? [];
}

export function useInvoiceQuery({ year, options }: UseInvoiceQueryProps) {
  return useQuery({
    queryKey: ["invoices", year],
    queryFn: () => fetchInvoicesForYear(year),
    ...options, // Optional parameters for caching, retry, etc.
  });
}