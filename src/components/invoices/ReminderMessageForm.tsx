import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

const reminderSchema = z.object({
  messageTemplate: z.string(),
  contacts: z.array(z.string()),
  customMessage: z.string().optional(),
});

type ReminderMessageFormProps = {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reminderNumber: 1 | 2 | 3;
};

export function ReminderMessageForm({
  invoice,
  isOpen,
  onClose,
  onSuccess,
  reminderNumber,
}: ReminderMessageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      contacts: [],
    },
  });

  const getTemplateMessage = (template: string) => {
    const dueDate = format(new Date(invoice.invDuedate), "dd/MM/yyyy");
    const amount = formatCurrency(invoice.invTotal);
    const invoiceNumber = invoice.invNumber.join("-");

    switch (template) {
      case "due":
        return `Your payment is due by ${dueDate}`;
      case "first":
        return `Your First payment reminder for ${invoiceNumber} and ${amount}`;
      case "second":
        return `Your Second payment reminder for ${invoiceNumber} and ${amount}`;
      case "final":
        return `Your Final payment reminder for ${invoiceNumber} and ${amount}`;
      default:
        return "";
    }
  };

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    try {
      setIsSubmitting(true);
      
      const message = values.customMessage || getTemplateMessage(values.messageTemplate);
      
      for (const contact of values.contacts) {
        const { error } = await supabase.functions.invoke('send-whatsapp-reminder', {
          body: {
            invId: invoice.invId,
            phone: contact,
            message,
            reminderNumber,
          },
        });

        if (error) throw error;
      }

      toast({
        title: "Reminder sent",
        description: "The payment reminder has been sent successfully.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reminder. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
  };

  const contacts = [
    {
      label: "Business Contact",
      value: String(invoice.customerMaster?.custWhatsapp),
    },
    {
      label: "Owner Contact",
      value: String(invoice.customerMaster?.custOwnerwhatsapp),
    },
  ].filter(contact => contact.value !== "null" && contact.value !== "undefined");

  const isTemplateDisabled = (template: string) => {
    switch (template) {
      case "first":
        return invoice.invReminder1;
      case "second":
        return invoice.invRemainder2;
      case "final":
        return invoice.invRemainder3;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="messageTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="due">Payment Due Reminder</SelectItem>
                      <SelectItem 
                        value="first" 
                        disabled={isTemplateDisabled("first")}
                      >
                        First Reminder
                      </SelectItem>
                      <SelectItem 
                        value="second"
                        disabled={isTemplateDisabled("second")}
                      >
                        Second Reminder
                      </SelectItem>
                      <SelectItem 
                        value="final"
                        disabled={isTemplateDisabled("final")}
                      >
                        Final Reminder
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contacts"
              render={() => (
                <FormItem>
                  <FormLabel>Send To</FormLabel>
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <div key={contact.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={form.getValues("contacts").includes(contact.value)}
                          onCheckedChange={(checked) => {
                            const currentContacts = form.getValues("contacts");
                            const newContacts = checked
                              ? [...currentContacts, contact.value]
                              : currentContacts.filter((c) => c !== contact.value);
                            form.setValue("contacts", newContacts);
                          }}
                        />
                        <span>{contact.label}: {contact.value}</span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Immediately"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}