import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { paymentColumns } from "./table-columns";

export function PaymentHistoryCard() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paymentTransactions")
        .select(`
          *,
          invoiceTable (
            invNumber,
            invTotal,
            customerMaster (
              id,
              custBusinessname,
              custWhatsapp
            )
          )
        `)
        .order('paymentDate', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-black">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={paymentColumns}
          data={payments || []}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}