import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import AddInvoiceButton from "../buttons/AddInvoiceButton";
import DownloadTemplateButton from "../buttons/DownloadTemplateButton";
import UploadInvoiceButton from "../buttons/UploadInvoiceButton";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useToast } from "@/components/ui/use-toast";

export default function InvoiceTab({ year }: { year: string }) {
  const { toast } = useToast();

  const { data: invoices, isLoading, error } = useQuery({
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

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load invoices",
    });
    return <div>Failed to load invoices</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AddInvoiceButton />
        <DownloadTemplateButton 
          columns={[
            { label: "Invoice Number", key: "invNumber" },
            { label: "Customer ID", key: "invCustid" },
            { label: "Invoice Date", key: "invDate" },
            { label: "Due Date", key: "invDuedate" },
            { label: "Total", key: "invTotal" },
            { label: "Status", key: "invPaymentStatus" },
          ]}
          tableName="invoiceTable"
        />
        <UploadInvoiceButton tableName="invoiceTable" />
      </div>
      
      <TransactionInvoiceTable 
        data={invoices || []}
        isLoading={isLoading}
      />
    </div>
  );
}