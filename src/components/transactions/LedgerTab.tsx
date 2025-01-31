import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/DataTable";
import { CustomerSelector } from "./CustomerSelector";
import { PDFExport } from "../buttons/PDFExport";
import type { Customer } from "@/types";

export default function LedgerTab({ year }: { year: string }) {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("id, custBusinessname, custWhatsapp, custCreditperiod");

      if (error) throw error;
      return data as Customer[];
    },
  });

  const handleCustomerClick = (customer: Customer) => {
    console.log("Customer clicked:", customer);
  };

  return (
    <div className="space-y-4">
      <CustomerSelector />
      <PDFExport data={customers || []} />
      <DataTable
        columns={[
          {
            accessorKey: "custBusinessname",
            header: "Business Name",
          },
          {
            accessorKey: "custCreditperiod",
            header: "Credit Period",
          },
          {
            accessorKey: "custWhatsapp",
            header: "WhatsApp",
          },
        ]}
        data={customers || []}
        isLoading={isLoading}
        onRowClick={handleCustomerClick}
      />
    </div>
  );
}
