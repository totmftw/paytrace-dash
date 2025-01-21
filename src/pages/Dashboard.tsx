import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { NewSaleForm } from "@/components/dashboard/NewSaleForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { data: reminders } = useQuery({
    queryKey: ["payment-reminders"],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname,
            custCreditperiod,
            custWhatsapp
          )
        `)
        .eq("invMarkcleared", false)
        .order("invDuedate", { ascending: true });

      if (error) throw error;

      const today = new Date();
      const reminderInvoices = invoices?.filter(invoice => {
        const dueDate = new Date(invoice.invDuedate);
        const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const creditPeriod = invoice.customerMaster?.custCreditperiod || 30;

        // Check if reminders need to be sent based on credit period
        if (creditPeriod <= 7) {
          // For short credit periods, space reminders evenly
          return daysToDue <= creditPeriod && !invoice.invReminder1;
        } else {
          // Standard reminder schedule
          return (
            (daysToDue <= 7 && !invoice.invReminder1) ||
            (daysToDue <= 15 && !invoice.invRemainder2) ||
            (daysToDue <= 1 && !invoice.invRemainder3)
          );
        }
      });

      return reminderInvoices;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ExcelUpload />
          <NewSaleForm />
        </div>
      </div>

      <PaymentMetrics />
      
      <div className="grid gap-4 md:grid-cols-3">
        <SalesOverview />
        {reminders && reminders.length > 0 && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Payment Reminders Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((invoice) => (
                  <div key={invoice.invId} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{invoice.customerMaster?.custBusinessname}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.invDuedate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button>Send Reminder</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Dashboard;