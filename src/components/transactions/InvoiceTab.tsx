import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import type { Invoice } from "@/types";

export default function InvoiceTab({ year }: { year: string }) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", year],
    queryFn: async () => {
      const [startYear, endYear] = year.split('-');
      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;

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
        .gte('invDate', startDate)
        .lte('invDate', endDate);

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }
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
      
      <TransactionInvoiceTable 
        data={invoices || []}
        isLoading={isLoading}
        onCustomerClick={handleCustomerClick}
        onInvoiceClick={handleInvoiceClick}
      />
    </div>
  );
}