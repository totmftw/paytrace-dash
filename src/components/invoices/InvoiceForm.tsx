import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const invoiceSchema = z.object({
  invNumber: z.array(z.number()).min(1, "Invoice number is required"),
  invDate: z.date({
    required_error: "Invoice date is required",
  }),
  invDuedate: z.date({
    required_error: "Due date is required",
  }),
  invValue: z.string().min(1, "Value is required"),
  invGst: z.string().min(1, "GST is required"),
  invAddamount: z.string().optional(),
  invSubamount: z.string().optional(),
  invCustid: z.number().min(1, "Customer is required"),
});

type InvoiceFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice?: any; // Add this line to accept invoice prop for editing
};

export function InvoiceForm({ isOpen, onClose, onSuccess, invoice }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice ? {
      invNumber: invoice.invNumber,
      invDate: invoice.invDate ? new Date(invoice.invDate) : undefined,
      invDuedate: invoice.invDuedate ? new Date(invoice.invDuedate) : undefined,
      invValue: invoice.invValue?.toString(),
      invGst: invoice.invGst?.toString(),
      invAddamount: invoice.invAddamount?.toString(),
      invSubamount: invoice.invSubamount?.toString(),
      invCustid: invoice.invCustid,
    } : undefined,
  });

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    try {
      setIsSubmitting(true);
      
      const total = parseFloat(values.invValue) + 
                    parseFloat(values.invGst) + 
                    (values.invAddamount ? parseFloat(values.invAddamount) : 0) - 
                    (values.invSubamount ? parseFloat(values.invSubamount) : 0);

      if (invoice) {
        // Update existing invoice
        const { error } = await supabase
          .from("invoiceTable")
          .update({
            invNumber: values.invNumber,
            invDate: format(values.invDate, "yyyy-MM-dd"),
            invDuedate: format(values.invDuedate, "yyyy-MM-dd"),
            invValue: parseFloat(values.invValue),
            invGst: parseFloat(values.invGst),
            invAddamount: values.invAddamount ? parseFloat(values.invAddamount) : null,
            invSubamount: values.invSubamount ? parseFloat(values.invSubamount) : null,
            invTotal: total,
          })
          .eq("invId", invoice.invId);

        if (error) throw error;

        toast({
          title: "Invoice updated",
          description: "The invoice has been successfully updated.",
        });
      } else {
        // Create new invoice
        const { error } = await supabase
          .from("invoiceTable")
          .insert({
            invNumber: values.invNumber,
            invDate: format(values.invDate, "yyyy-MM-dd"),
            invDuedate: format(values.invDuedate, "yyyy-MM-dd"),
            invValue: parseFloat(values.invValue),
            invGst: parseFloat(values.invGst),
            invAddamount: values.invAddamount ? parseFloat(values.invAddamount) : null,
            invSubamount: values.invSubamount ? parseFloat(values.invSubamount) : null,
            invTotal: total,
            invBalanceAmount: total,
            invCustid: values.invCustid,
          });

        if (error) throw error;

        toast({
          title: "Invoice created",
          description: "The invoice has been successfully created.",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save invoice. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="text" 
                      value={field.value?.join('-') || ''} 
                      onChange={(e) => {
                        const value = e.target.value;
                        const numbers = value.split('-').map(num => parseInt(num)).filter(num => !isNaN(num));
                        field.onChange(numbers);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invDuedate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invGst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invAddamount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invSubamount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtracted Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" />
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
                {isSubmitting ? (invoice ? "Updating..." : "Creating...") : (invoice ? "Update Invoice" : "Create Invoice")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}