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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reminderSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type WhatsAppReminderProps = {
  selectedInvoices: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function WhatsAppReminder({ selectedInvoices, isOpen, onClose, onSuccess }: WhatsAppReminderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
  });

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    try {
      setIsSubmitting(true);
      
      for (const invoice of selectedInvoices) {
        const { error } = await supabase.functions.invoke('send-whatsapp-reminder', {
          body: {
            invId: invoice.invId,
            phone: invoice.customerMaster.custWhatsapp.toString(),
            message: values.message,
            reminderNumber: !invoice.invReminder1 ? 1 : !invoice.invRemainder2 ? 2 : 3
          }
        });

        if (error) throw error;
      }

      toast({
        title: "Reminders sent",
        description: "WhatsApp reminders have been sent successfully.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send WhatsApp Reminder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reminders"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}