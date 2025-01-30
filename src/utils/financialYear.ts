import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoiceTable"]["Row"];

export const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // JavaScript months are 0-based
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const getInvoicesForFY = async (fy: string) => {
  const { data, error } = await supabase
    .from("invoiceTable")
    .select("*")
    .eq("fy", fy);

  if (error) throw error;
  return data as Invoice[];
};