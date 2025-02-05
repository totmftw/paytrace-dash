import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerTable } from "@/components/customers/CustomerTable";
import type { Invoice } from "@/types/types";

export default function Customers() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
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
        `);
      if (error) throw error;
      return data as Invoice[];
    },
  });

  return (
    <div className="container mx-auto py-10">
      <CustomerTable data={invoices || []} isLoading={isLoading} />
    </div>
  );
}