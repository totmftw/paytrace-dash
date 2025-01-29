import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export const PaymentTracking = () => {
  const { selectedYear } = useFinancialYear();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["payment-tracking", selectedYear],
    queryFn: async () => {
      const year = parseInt(selectedYear.split('-')[0]);
      const startDate = new Date(year, 3, 1).toISOString(); // April 1st
      const endDate = new Date(year + 1, 2, 31).toISOString(); // March 31st

      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname,
            custCreditperiod
          )
        `)
        .gte("invDate", startDate)
        .lte("invDate", endDate)
        .order("invDuedate", { ascending: true });

      if (error) throw error;

      const today = new Date();
      return data?.map(invoice => {
        const dueDate = new Date(invoice.invDuedate);
        const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        let status: 'overdue' | 'pending' | 'cleared' = 'pending';
        if (invoice.invMarkcleared) {
          status = 'cleared';
        } else if (daysToDue < 0) {
          status = 'overdue';
        }

        return {
          ...invoice,
          daysToDue,
          status
        };
      });
    },
    refetchInterval: 300000,
  });

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {invoices?.map((invoice) => (
              <div
                key={invoice.invId}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  invoice.status === 'overdue'
                    ? 'border-red-200 bg-red-50'
                    : invoice.status === 'cleared'
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {invoice.status === 'overdue' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : invoice.status === 'cleared' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{invoice.customerMaster?.custBusinessname}</p>
                    <p className="text-sm text-muted-foreground">
                      Invoice: {invoice.invNumber.join("-")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(invoice.invDuedate).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">
                      Amount: {formatCurrency(invoice.invTotal)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    invoice.status === 'overdue'
                      ? 'text-red-600'
                      : invoice.status === 'cleared'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {invoice.status === 'cleared'
                      ? 'Paid'
                      : invoice.status === 'overdue'
                      ? `${Math.abs(invoice.daysToDue)} days overdue`
                      : `${invoice.daysToDue} days remaining`}
                  </p>
                  {invoice.status !== 'cleared' && (
                    <p className="text-xs text-muted-foreground">
                      Credit Period: {invoice.customerMaster?.custCreditperiod || 30} days
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(!invoices || invoices.length === 0) && (
              <p className="text-center text-muted-foreground">No invoices found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};