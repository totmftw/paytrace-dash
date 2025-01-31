import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invMarkcleared: boolean;
  customerMaster: {
    custBusinessname: string;
    custCreditperiod: number;
  };
}

export const PaymentTracking = () => {
  const { selectedYear, startDate, endDate } = useFinancialYear();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["payment-tracking", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!fk_invcustid_customer (
            custBusinessname,
            custCreditperiod
          )
        `)
        .gte("invDate", startDate.toISOString())
        .lte("invDate", endDate.toISOString())
        .order("invDuedate", { ascending: true });

      if (error) throw error;
      return data as Invoice[];
    },
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
            {invoices?.map((invoice) => {
              const dueDate = new Date(invoice.invDuedate);
              const today = new Date();
              const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const status = invoice.invMarkcleared ? 'cleared' : daysToDue < 0 ? 'overdue' : 'pending';

              return (
                <div
                  key={invoice.invId}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    status === 'overdue'
                      ? 'border-red-200 bg-red-50'
                      : status === 'cleared'
                      ? 'border-green-200 bg-green-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {status === 'overdue' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : status === 'cleared' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{invoice.customerMaster?.custBusinessname}</p>
                      <p className="text-sm text-muted-foreground">
                        Invoice: {invoice.invNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.invDuedate).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium">
                        Amount: {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(invoice.invTotal)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      status === 'overdue'
                        ? 'text-red-600'
                        : status === 'cleared'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      {status === 'cleared'
                        ? 'Paid'
                        : status === 'overdue'
                        ? `${Math.abs(daysToDue)} days overdue`
                        : `${daysToDue} days remaining`}
                    </p>
                    {status !== 'cleared' && (
                      <p className="text-xs text-muted-foreground">
                        Credit Period: {invoice.customerMaster?.custCreditperiod || 30} days
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {(!invoices || invoices.length === 0) && (
              <p className="text-center text-muted-foreground">No invoices found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
