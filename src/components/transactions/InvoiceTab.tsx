import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import { ColumnConfigProvider } from "@/contexts/columnConfigContext";
import type { Invoice } from "@/types";

export default function InvoiceTab({ year }: { year: string }) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", year],
    queryFn: async () => {
      const [startYear] = year.split('-');
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
            paymentId,
            amount,
            paymentDate,
            transactionId,
            paymentMode,
            chequeNumber,
            bankName,
            remarks
          )
        `)
        .gte("invDate", `${startYear}-04-01`)
        .lte("invDate", `${parseInt(startYear) + 1}-03-31`);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const handleCustomerClick = (customer: any) => {
    console.log('Customer clicked:', customer);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    console.log('Invoice clicked:', invoice);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AddInvoiceButton />
        <DownloadTemplateButton tableName="invoiceTable" />
        <UploadInvoiceButton />
      </div>
      
      <ColumnConfigProvider>
        <TransactionInvoiceTable 
          data={invoices || []}
          isLoading={isLoading}
          onCustomerClick={handleCustomerClick}
          onInvoiceClick={handleInvoiceClick}
        />
      </ColumnConfigProvider>
    </div>
  );
}