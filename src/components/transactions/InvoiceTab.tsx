import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";

export default function InvoiceTab({ year }: { year: string }) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select('*')
        .gte("invDate", `${year}-04-01`)
        .lte("invDate", `${parseInt(year) + 1}-03-31`);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AddInvoiceButton />
        <DownloadTemplateButton tableName="invoiceTable" />
        <UploadInvoiceButton />
      </div>
      
      <TransactionInvoiceTable 
        data={invoices || []}
        isLoading={isLoading}
        onCustomerClick={() => {}}
        onInvoiceClick={() => {}}
      />
    </div>
  );
}