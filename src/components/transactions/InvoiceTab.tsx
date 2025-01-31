import { useQuery } from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import type { Invoice } from "@/types/types";

export default function InvoiceTab({ year }: { year: string }) {
  const [startYear, endYear] = year.split('-');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp
          ),
          paymentTransactions (
            amount,
            paymentId
          )
        `)
        .gte("invDate", `${startYear}-04-01`)
        .lte("invDate", `${endYear}-03-31`);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AddInvoiceButton />
        <DownloadTemplateButton tableName="invoiceTable" fileName={`Invoice_Template_${startYear}.xlsx`} />
        <UploadInvoiceButton tableName="invoiceTable" />
      </div>
      
      <TransactionInvoiceTable 
        data={invoices || []}
        isLoading={isLoading}
      />
    </div>
  );
}