
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import type { Invoice } from "@/types";

export default function PaymentTab({ year }: { year: string }) {
  const [startYear] = year.split('-');

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["invoices", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp,
            custPhone,
            custGST
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            invId,
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

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }

      return data as Invoice[];
    },
  });

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AddInvoiceButton />
        <div className="flex items-center gap-4">
          <DownloadTemplateButton tableName="invoiceTable" />
          <UploadInvoiceButton />
        </div>
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
