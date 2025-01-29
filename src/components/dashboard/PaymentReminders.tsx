import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PaymentReminders() {
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getFinancialYearStart = (year: number) => new Date(`${year}-04-01`).toISOString();
  const getFinancialYearEnd = (year: number) => new Date(`${year + 1}-03-31`).toISOString();

  const { data: reminders } = useQuery({
    queryKey: ["payment-reminders", financialYear],
    queryFn: async () => {
      const startDate = getFinancialYearStart(financialYear);
      const endDate = getFinancialYearEnd(financialYear);

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
        .gte("invDate", startDate)
        .lte("invDate", endDate)
        .order("invDuedate", { ascending: true });

      if (error) throw error;

      const today = new Date();
      return invoices?.filter(invoice => {
        const dueDate = new Date(invoice.invDuedate);
        const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const creditPeriod = invoice.customerMaster?.custCreditperiod || 30;

        if (creditPeriod <= 7) {
          const interval = Math.floor(creditPeriod / 3);
          return (
            (daysToDue <= creditPeriod && !invoice.invReminder1) ||
            (daysToDue <= creditPeriod - interval && !invoice.invRemainder2) ||
            (daysToDue <= creditPeriod - (2 * interval) && !invoice.invRemainder3)
          );
        } else {
          return (
            (daysToDue <= 7 && !invoice.invReminder1) ||
            (daysToDue <= 15 && !invoice.invRemainder2) ||
            (daysToDue <= 1 && !invoice.invRemainder3)
          );
        }
      });
    },
    refetchInterval: 300000,
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ 
      invId, 
      phone, 
      message, 
      reminderNumber 
    }: { 
      invId: number; 
      phone: string; 
      message: string; 
      reminderNumber: 1 | 2 | 3;
    }) => {
      // First get the active WhatsApp config
      const { data: configs, error: configError } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (configError) throw configError;
      if (!configs || configs.length === 0) {
        throw new Error('No active WhatsApp configuration found');
      }

      const response = await supabase.functions.invoke('send-whatsapp-reminder', {
        body: {
          invId,
          phone,
          message,
          reminderNumber,
          config: configs[0]  // Pass the active config to the edge function
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-reminders", financialYear] });
      toast({
        title: "Reminder sent",
        description: "The payment reminder has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reminder. Please try again.",
      });
      console.error("Error sending reminder:", error);
    },
  });

  const getReminderMessage = (invoice: any, reminderNumber: number) => {
    const dueDate = new Date(invoice.invDuedate).toLocaleDateString();
    const amount = formatCurrency(invoice.invTotal);
    
    switch (reminderNumber) {
      case 1:
        return `Dear ${invoice.customerMaster.custBusinessname}, this is a friendly reminder about invoice ${invoice.invNumber.join("-")} for ${amount} due on ${dueDate}.`;
      case 2:
        return `Important reminder: Invoice ${invoice.invNumber.join("-")} for ${amount} is due on ${dueDate}. Please ensure timely payment.`;
      case 3:
        return `Urgent: Invoice ${invoice.invNumber.join("-")} for ${amount} is due tomorrow. Please process the payment immediately.`;
      default:
        return "";
    }
  };

  const getReminderStatus = (invoice: any) => {
    const reminders = [];
    if (invoice.invReminder1) reminders.push("1st");
    if (invoice.invRemainder2) reminders.push("2nd");
    if (invoice.invRemainder3) reminders.push("3rd");
    
    if (reminders.length === 0) return null;
    
    return (
      <Badge variant="secondary">
        Sent: {reminders.join(", ")}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Reminders</CardTitle>
        <Select
          value={financialYear.toString()}
          onValueChange={(value) => setFinancialYear(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Financial Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}-{year + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders?.map((invoice) => {
            const dueDate = new Date(invoice.invDuedate);
            const today = new Date();
            const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            const reminderNumber = daysToDue <= 1 ? 3 : daysToDue <= 15 ? 2 : 1;

            return (
              <div key={invoice.invId} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <p className="font-medium">{invoice.customerMaster?.custBusinessname}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {dueDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amount: {formatCurrency(invoice.invTotal)}
                  </p>
                  {getReminderStatus(invoice)}
                </div>
                <Button
                  onClick={() => {
                    if (!invoice.customerMaster?.custWhatsapp) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "No WhatsApp number available for this customer.",
                      });
                      return;
                    }

                    sendReminderMutation.mutate({
                      invId: invoice.invId,
                      phone: String(invoice.customerMaster.custWhatsapp),
                      message: getReminderMessage(invoice, reminderNumber),
                      reminderNumber,
                    });
                  }}
                  disabled={sendReminderMutation.isPending}
                >
                  Send Reminder
                </Button>
              </div>
            );
          })}
          {(!reminders || reminders.length === 0) && (
            <p className="text-center text-muted-foreground">No reminders needed at this time.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}