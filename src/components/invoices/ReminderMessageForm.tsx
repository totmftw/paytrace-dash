import { useState, useEffect } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const reminderSchema = z.object({
  messageTemplate: z.string(),
  contacts: z.array(z.string()),
  customMessage: z.string().optional(),
  isCustomMessage: z.boolean().default(false),
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
  const [showAlert, setShowAlert] = useState(false);
  const { toast } = useToast();
  const [isCustomMessage, setIsCustomMessage] = useState(false);
  
  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      contacts: [String(invoice.customerMaster?.custOwnerwhatsapp)],
      isCustomMessage: false,
    },
  });

  const getTemplateMessage = (template: string) => {
    const dueDate = format(new Date(invoice.invDuedate), "dd/MM/yyyy");
    const amount = formatCurrency(invoice.invTotal);
    const invoiceNumber = invoice.invNumber.join("-");
    const outstandingAmount = formatCurrency(invoice.invBalanceAmount || 0);

    switch (template) {
      case "due":
        return `Your payment is due by ${dueDate}`;
      case "first":
        return `Your First payment reminder for ${invoiceNumber} and ${amount}`;
      case "second":
        return `Your Second payment reminder for ${invoiceNumber} and ${amount}`;
      case "final":
        return `Your Final payment reminder for ${invoiceNumber} and ${amount}`;
      case "custom":
        return `Outstanding amount: ${outstandingAmount}`;
      default:
        return "";
    }
  };

  useEffect(() => {
    if (!isCustomMessage) {
      const template = form.getValues("messageTemplate");
      if (template) {
        form.setValue("customMessage", getTemplateMessage(template));
      }
    }
  }, [form.watch("messageTemplate"), isCustomMessage]);

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    if (invoice.invBalanceAmount > 0 && !showAlert) {
      setShowAlert(true);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const message = values.isCustomMessage ? values.customMessage : getTemplateMessage(values.messageTemplate);
      
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
      setShowAlert(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setIsCustomMessage(false);
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

  const hasOutstandingPayment = invoice.invBalanceAmount > 0;
  const customerNameStyle = hasOutstandingPayment ? 
    "text-red-500 animate-pulse font-bold text-lg mb-4" : 
    "font-bold text-lg mb-4";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
          </DialogHeader>
          <div className={customerNameStyle}>
            {invoice.customerMaster?.custBusinessname}
          </div>
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
                    <FormLabel className="!mt-0">Custom Message</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="messageTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Template</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isCustomMessage}
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
                          disabled={invoice.invReminder1}
                        >
                          First Reminder
                        </SelectItem>
                        <SelectItem 
                          value="second"
                          disabled={invoice.invRemainder2}
                        >
                          Second Reminder
                        </SelectItem>
                        <SelectItem 
                          value="final"
                          disabled={invoice.invRemainder3}
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
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={5} 
                        readOnly={!isCustomMessage}
                        className={!isCustomMessage ? "bg-gray-100" : ""}
                      />
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

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Outstanding Payment Alert</AlertDialogTitle>
            <AlertDialogDescription>
              This customer has an outstanding payment of {formatCurrency(invoice.invBalanceAmount)}. 
              Do you want to continue sending the reminder?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()}>
              Noted & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}