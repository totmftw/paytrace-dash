import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/DataTable";
import { CustomerSelector } from "./CustomerSelector";
import { PDFExport } from "@/components/buttons/PDFExport";
import type { Customer } from "@/types";

export default function LedgerTab({ year }: { year: string }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("id, custBusinessname, custWhatsapp, custCreditperiod");
      if (error) throw error;
      return data as Customer[];
    }
  });

  const pdfData = customers?.map(customer => ({
    name: customer.custBusinessname,
    whatsapp: customer.custWhatsapp,
    creditPeriod: customer.custCreditperiod
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CustomerSelector
          selectedCustomerId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
          customers={customers}
          isLoading={isLoadingCustomers}
        />
        <PDFExport fileName="ledger.pdf" data={pdfData} />
      </div>
      <DataTable
        columns={[
          { accessorKey: "custBusinessname", header: "Customer" },
          { accessorKey: "custCreditperiod", header: "Credit Period" },
          { accessorKey: "custWhatsapp", header: "WhatsApp" }
        ]}
        data={customers || []}
        isLoading={isLoadingCustomers}
      />
    </div>
  );
}