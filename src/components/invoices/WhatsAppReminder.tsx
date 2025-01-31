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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerMessagePreview } from "./CustomerMessagePreview";
import { Settings } from "lucide-react";

const reminderSchema = z.object({
  isCustomMessage: z.boolean().default(false),
  customerMessages: z.record(z.string(), z.string()),
});

const configSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  templateNamespace: z.string().min(1, "Template Namespace is required"),
  templateName: z.string().min(1, "Template Name is required"),
  fromPhoneNumberId: z.string().min(1, "Phone Number ID is required"),
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
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const { toast } = useToast();
  const [isCustomMessage, setIsCustomMessage] = useState(false);

  const configForm = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      apiKey: "",
      templateNamespace: "",
      templateName: "",
      fromPhoneNumberId: "",
    },
  });

  // Group invoices by business name
  const customerInvoices = selectedInvoices.reduce((acc, invoice) => {
    const businessName = invoice.customerMaster?.custBusinessname;
    if (!acc[businessName]) {
      acc[businessName] = {
        customer: invoice.customerMaster,
        invoices: []
      };
    }
    acc[businessName].invoices.push(invoice);
    return acc;
  }, {});
  
  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      isCustomMessage: false,
      customerMessages: Object.keys(customerInvoices).reduce((acc, businessName) => {
        acc[businessName] = "";
        return acc;
      }, {}),
    },
  });

  const fetchCurrentConfig = async () => {
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching config:', error);
      return;
    }

    if (data) {
      setCurrentConfig(data);
      configForm.reset({
        apiKey: data.api_key,
        templateNamespace: data.template_namespace,
        templateName: data.template_name,
        fromPhoneNumberId: data.from_phone_number_id,
      });
    }
  };

  const handleConfigSubmit = async (values: z.infer<typeof configSchema>) => {
    try {
      const { error } = await supabase
        .from('whatsapp_config')
        .insert({
          api_key: values.apiKey,
          template_namespace: values.templateNamespace,
          template_name: values.templateName,
          from_phone_number_id: values.fromPhoneNumberId,
        });

      if (error) throw error;

      toast({
        title: "Configuration Updated",
        description: "WhatsApp configuration has been updated successfully.",
      });

      fetchCurrentConfig();
      setIsConfigOpen(false);
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update WhatsApp configuration.",
      });
    }
  };

  const handleNewConfig = () => {
    configForm.reset({
      apiKey: "",
      templateNamespace: "",
      templateName: "",
      fromPhoneNumberId: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Send messages for each business separately
      for (const businessName in customerInvoices) {
        const customerData = customerInvoices[businessName];
        const message = values.isCustomMessage 
          ? values.customerMessages[businessName]
          : form.getValues().customerMessages[businessName];
        
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Send Payment Reminders</span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsConfigOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Configure WhatsApp
              </Button>
            </DialogTitle>
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
                  {Object.entries(customerInvoices).map(([businessName, data]: [string, any]) => (
                    <FormField
                      key={businessName}
                      control={form.control}
                      name={`customerMessages.${businessName}`}
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

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>WhatsApp Configuration</DialogTitle>
          </DialogHeader>
          <Form {...configForm}>
            <form onSubmit={configForm.handleSubmit(handleConfigSubmit)} className="space-y-4">
              <FormField
                control={configForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={configForm.control}
                name="templateNamespace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Namespace</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={configForm.control}
                name="templateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={configForm.control}
                name="fromPhoneNumberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Phone Number ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNewConfig}
                >
                  New Configuration
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsConfigOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Configuration</Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}