
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/types";

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
      customerMaster:customerMaster!invoiceTable_invCustid_fkey (
        custBusinessname,
        custCreditperiod,
        custWhatsapp,
        custPhone,
        custGST
      ),
      paymentTransactions (
        paymentId,
        amount,
        paymentDate,
        transactionId,
        paymentMode,
        chequeNumber,
        bankName,
        remarks
      )
    `)
    .gte("invDate", `${startYear}-04-01`)
    .lte("invDate", `${parseInt(startYear) + 1}-03-31`);

  if (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }

  return data as unknown as Invoice[];
}

export function useInvoiceQuery({ year, options }: UseInvoiceQueryProps) {
  return useQuery({
    queryKey: ["invoices", year],
    queryFn: () => fetchInvoicesForYear(year),
    ...options,
  });
}
