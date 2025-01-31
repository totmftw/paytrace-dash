import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
// src/utils/financialYear.ts
export const generateFinancialYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({
    label: `FY ${currentYear - 2 + i}-${currentYear - 1 + i}`,
    value: `${currentYear - 2 + i}`,
  }));
};

export const getFinancialYearDates = (year: string) => {
  const start = new Date(`${year}-04-01`);
  const end = new Date(`${Number(year) + 1}-03-31`);
  return { start, end };
};

export const getFinancialYearDates = (year: string) => {
  const start = new Date(`${year}-04-01`);
  const end = new Date(`${parseInt(year) + 1}-03-31`);
  return { start, end };
};


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