import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/datatable";
import { PDFExport } from "@/components/buttons/PDFExport";
import { Card } from "@/components/ui/card";
import { ColumnConfigProvider } from "@/contexts/columnConfigContext";
import type { Customer } from "@/types";

export default function LedgerTab() {
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("*");

      if (error) throw error;
      return data;
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
      <ColumnConfigProvider>
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
      </ColumnConfigProvider>
    </Card>
  );
}