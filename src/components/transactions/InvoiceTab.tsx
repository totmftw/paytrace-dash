import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export default function InvoiceTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select('*')
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