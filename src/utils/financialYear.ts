import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database['public']['Tables']['invoiceTable']['Row'];

export const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  if (month < 3) {
    return `${year-1}-${year}`;
  }
  return `${year}-${year+1}`;
};

export const getInvoicesForFY = async (fy: string) => {
  const { data, error } = await supabase
    .from("invoiceTable")
    .select("*")
    .eq("fy", fy);

  if (error) throw error;
  return data as Invoice[];
};