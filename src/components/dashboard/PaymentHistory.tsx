import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export function PaymentHistory() {
  const { data: payments } = useQuery({
    queryKey: ["dashboard-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paymentTransactions")
        .select(`
          *,
          invoiceTable!paymentTransactions_invId_fkey (
            invNumber,
            customerMaster!invoiceTable_invCustid_fkey (
              custBusinessname
            )
          )
        `)
        .order("paymentDate", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {payments?.map((payment) => (
              <div
                key={payment.paymentId}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">
                    {payment.invoiceTable?.customerMaster?.custBusinessname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Invoice #{payment.invoiceTable?.invNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}