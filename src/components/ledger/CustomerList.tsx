
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CustomerMaster } from "@/types";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("*");

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      return data as CustomerMaster[];
    },
  });
};

export const CustomerList = () => {
  const { data: customers, isLoading, error } = useCustomers();

  if (isLoading) return <div>Loading customers...</div>;
  if (error) return <div>Error loading customers</div>;

  return customers || [];
};

