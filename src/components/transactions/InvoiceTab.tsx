import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { Button } from "@/components/ui/button";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";

export default function InvoiceTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            id, 
            custBusinessname, 
            custWhatsapp
          )
        `)
        .gte('invDate', start.toISOString())
        .lte('invDate', end.toISOString());

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AddInvoiceButton />
        <DownloadTemplateButton tableName="invoiceTable" />
        <UploadInvoiceButton tableName="invoiceTable" />
      </div>
      
      <TransactionInvoiceTable 
        data={invoices || []}
        onCustomerClick={(customer) => {
          // Handle customer click
        }}
        onInvoiceClick={(invoice) => {
          // Handle invoice click
        }}
      />
    </div>
  );
}