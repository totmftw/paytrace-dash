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
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerMessagePreview } from "./CustomerMessagePreview";

const reminderSchema = z.object({
  isCustomMessage: z.boolean().default(false),
  customerMessages: z.record(z.string(), z.string()),
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
      isCustomMessage: false,
      customerMessages: Object.keys(customerInvoices).reduce((acc, custId) => {
        acc[custId] = "";
        return acc;
      }, {}),
    },
  });

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    try {
      setIsSubmitting(true);
      
      for (const custId in customerInvoices) {
        const customerData = customerInvoices[custId];
        const message = values.isCustomMessage 
          ? values.customerMessages[custId]
          : form.getValues().customerMessages[custId];
        
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
      <DialogContent className="sm:max-w-[800px]">
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
                  <FormLabel className="!mt-0">Use Custom Messages</FormLabel>
                </FormItem>
              )}
            />

            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-6 p-4">
                {Object.entries(customerInvoices).map(([custId, data]: [string, any]) => (
                  <FormField
                    key={custId}
                    control={form.control}
                    name={`customerMessages.${custId}`}
                    render={({ field }) => (
                      <CustomerMessagePreview
                        customer={data.customer}
                        invoices={data.invoices}
                        isCustomMessage={isCustomMessage}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </div>
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