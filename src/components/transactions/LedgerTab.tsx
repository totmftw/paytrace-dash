import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/datatable";
import { PDFExport } from "@/components/buttons/PDFExport";
import type { Customer } from "@/types";

export default function LedgerTab({ year }: { year: string }) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("id, custBusinessname, custWhatsapp, custCreditperiod");

      if (error) throw error;
      return data as Customer[];
    },
  });

  const exportData = customers?.map(customer => ({
    name: customer.custBusinessname,
    whatsapp: customer.custWhatsapp,
    creditPeriod: customer.custCreditperiod
  })) || [];

  return (
    <Card className="p-4">
      <PDFExport data={exportData} fileName="customer-ledger.pdf" />
      <DataTable
        data={customers || []}
        columns={[
          {
            accessorKey: "custBusinessname",
            header: "Business Name"
          },
          {
            accessorKey: "custWhatsapp",
            header: "WhatsApp"
          }
        ]}
      />
    </Card>
  );
}