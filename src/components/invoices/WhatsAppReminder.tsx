import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const reminderSchema = z.object({
  contacts: z.array(z.string()),
  customMessage: z.string().optional(),
  isCustomMessage: z.boolean().default(false),
});

type WhatsAppReminderProps = {
  selectedInvoices: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function WhatsAppReminder({
  selectedInvoices,
  isOpen,
  onClose,
  onSuccess,
}: WhatsAppReminderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [isCustomMessage, setIsCustomMessage] = useState(false);

  // Group invoices by customer
  const customerInvoices = selectedInvoices.reduce((acc, invoice) => {
    const custId = invoice.customerMaster?.id;
    if (!acc[custId]) {
      acc[custId] = {
        customer: invoice.customerMaster,
        invoices: []
      };
    }
    acc[custId].invoices.push(invoice);
    return acc;
  }, {});
  
  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      contacts: Object.values(customerInvoices).map(
        ({ customer }: any) => String(customer?.custOwnerwhatsapp)
      ),
      isCustomMessage: false,
    },
  });

  const getTemplateMessage = (customerData: any) => {
    const { customer, invoices } = customerData;
    let totalPending = 0;
    const invoiceDetails = invoices.map(invoice => {
      const pending = invoice.invBalanceAmount || 0;
      totalPending += pending;
      return `Invoice ${invoice.invNumber.join("-")} dated ${format(new Date(invoice.invDate), "dd/MM/yyyy")} - Amount Due: ${formatCurrency(pending)}`;
    }).join("\n");

    return `Dear ${customer.custBusinessname},\n\nThis is a reminder for the following pending payment(s):\n\n${invoiceDetails}\n\nTotal Amount Due: ${formatCurrency(totalPending)}\n\nKindly arrange for the payment at your earliest convenience.`;
  };

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    try {
      setIsSubmitting(true);
      
      for (const custId in customerInvoices) {
        const customerData = customerInvoices[custId];
        const message = values.isCustomMessage ? values.customMessage : getTemplateMessage(customerData);
        
        if (!customerData.customer?.custWhatsapp) continue;
        
        // Send message for each invoice of the customer
        for (const invoice of customerData.invoices) {
          const { error } = await supabase.functions.invoke('send-whatsapp-reminder', {
            body: {
              invId: invoice.invId,
              phone: customerData.customer.custWhatsapp.toString(),
              message,
              reminderNumber: 1 // Default to 1 for bulk messages
            },
          });

          if (error) throw error;
        }
      }

      toast({
        title: "Messages sent",
        description: "The payment reminders have been sent successfully.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reminders. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminders</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isCustomMessage"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsCustomMessage(!!checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Use Custom Message</FormLabel>
                </FormItem>
              )}
            />

            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Preview</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={10} 
                        readOnly={!isCustomMessage}
                        className={!isCustomMessage ? "bg-gray-100" : ""}
                        value={isCustomMessage ? field.value : Object.values(customerInvoices).map(
                          (customerData: any) => getTemplateMessage(customerData)
                        ).join("\n\n---\n\n")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ScrollArea>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Messages"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}