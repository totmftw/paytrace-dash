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

  const handleExport = () => {
    // Export logic here
  };

  return (
    <Card className="p-4">
      <PDFExport onClick={handleExport} fileName="customer-ledger.pdf">
        Export Customer Ledger
      </PDFExport>
      <DataTable
        data={customers || []}
        columns={[
          {
            key: "custBusinessname",
            header: "Business Name"
          },
          {
            key: "custWhatsapp",
            header: "WhatsApp"
          }
        ]}
      />
    </Card>
  );
}