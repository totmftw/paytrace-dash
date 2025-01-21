import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function WhatsappReminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState({
    reminder1: "Dear {customer}, this is a friendly reminder about invoice {invoice} for {amount} due on {date}.",
    reminder2: "Important reminder: Invoice {invoice} for {amount} is due on {date}. Please ensure timely payment.",
    reminder3: "Urgent: Invoice {invoice} for {amount} is due tomorrow. Please process the payment immediately."
  });

  const { data: pendingInvoices } = useQuery({
    queryKey: ["pending-invoices"],
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
      return invoices;
    },
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
      const response = await supabase.functions.invoke("send-whatsapp-reminder", {
        body: {
          invId,
          phone,
          message,
          reminderNumber,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invoices"] });
      toast({
        title: "Reminder sent",
        description: "The payment reminder has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reminder. Please try again.",
      });
      console.error("Error sending reminder:", error);
    },
  });

  const formatMessage = (template: string, invoice: any) => {
    const dueDate = new Date(invoice.invDuedate).toLocaleDateString();
    return template
      .replace("{customer}", invoice.customerMaster?.custBusinessname)
      .replace("{invoice}", invoice.invNumber.join("-"))
      .replace("{amount}", formatCurrency(invoice.invTotal))
      .replace("{date}", dueDate);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">WhatsApp Reminders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">First Reminder (7 days)</h3>
            <Textarea
              value={templates.reminder1}
              onChange={(e) => setTemplates(prev => ({ ...prev, reminder1: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Second Reminder (15 days)</h3>
            <Textarea
              value={templates.reminder2}
              onChange={(e) => setTemplates(prev => ({ ...prev, reminder2: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Final Reminder (1 day before due)</h3>
            <Textarea
              value={templates.reminder3}
              onChange={(e) => setTemplates(prev => ({ ...prev, reminder3: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingInvoices?.map((invoice) => {
              const dueDate = new Date(invoice.invDuedate);
              const today = new Date();
              const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const creditPeriod = invoice.customerMaster?.custCreditperiod || 30;
              
              let reminderNumber: 1 | 2 | 3;
              let reminderTemplate: string;
              
              if (creditPeriod <= 7) {
                const interval = Math.floor(creditPeriod / 3);
                if (daysToDue <= creditPeriod - (2 * interval)) {
                  reminderNumber = 3;
                  reminderTemplate = templates.reminder3;
                } else if (daysToDue <= creditPeriod - interval) {
                  reminderNumber = 2;
                  reminderTemplate = templates.reminder2;
                } else {
                  reminderNumber = 1;
                  reminderTemplate = templates.reminder1;
                }
              } else {
                if (daysToDue <= 1) {
                  reminderNumber = 3;
                  reminderTemplate = templates.reminder3;
                } else if (daysToDue <= 15) {
                  reminderNumber = 2;
                  reminderTemplate = templates.reminder2;
                } else {
                  reminderNumber = 1;
                  reminderTemplate = templates.reminder1;
                }
              }

              return (
                <div key={invoice.invId} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{invoice.customerMaster?.custBusinessname}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {dueDate.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Amount: {formatCurrency(invoice.invTotal)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Days to due: {daysToDue}
                    </p>
                  </div>
                  <div className="space-y-2">
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
                          message: formatMessage(reminderTemplate, invoice),
                          reminderNumber,
                        });
                      }}
                      disabled={sendReminderMutation.isPending}
                    >
                      Send Reminder {reminderNumber}
                    </Button>
                  </div>
                </div>
              );
            })}
            {(!pendingInvoices || pendingInvoices.length === 0) && (
              <p className="text-center text-muted-foreground">No pending invoices found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}