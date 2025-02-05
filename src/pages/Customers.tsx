
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerTable } from "@/components/customers/CustomerTable";
import type { Invoice } from "@/types";

export default function Customers() {
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["invoices"],
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
        `);

      if (error) {
        console.error("Error fetching customer data:", error);
        throw error;
      }

      return data as unknown as Invoice[];
    },
  });

  if (error) return <div>Error loading customer data</div>;

  return (
    <div className="container mx-auto py-10">
      <CustomerTable data={invoices || []} isLoading={isLoading} />
    </div>
  );
}
