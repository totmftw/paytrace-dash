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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const paymentSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  amount: z.string().min(1, "Amount is required"),
  remarks: z.string().optional(),
});

type PaymentFormProps = {
  invoice: {
    invId: number;
    invTotal: number;
    invBalanceAmount: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PaymentForm({ invoice, isOpen, onClose, onSuccess }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: invoice.invBalanceAmount?.toString() || invoice.invTotal.toString(),
    },
  });

  const onSubmit = async (values: z.infer<typeof paymentSchema>) => {
    try {
      setIsSubmitting(true);
      
      const paymentAmount = parseFloat(values.amount);
      const balanceAmount = invoice.invBalanceAmount || invoice.invTotal;
      const paymentDifference = balanceAmount - paymentAmount;
      
      // Insert payment record
      const { error: paymentError } = await supabase
        .from("paymentTransactions")
        .insert({
          invId: invoice.invId,
          transactionId: values.transactionId,
          paymentMode: values.paymentMode,
          chequeNumber: values.chequeNumber,
          bankName: values.bankName,
          paymentDate: format(values.paymentDate, "yyyy-MM-dd"),
          amount: paymentAmount,
          remarks: values.remarks,
        });

      if (paymentError) throw paymentError;

      // Update invoice payment status
      const { error: invoiceError } = await supabase
        .from("invoiceTable")
        .update({
          invBalanceAmount: paymentDifference,
          invPaymentDifference: paymentDifference,
          invPaymentStatus: paymentDifference <= 0 ? 'paid' : 'partial',
          invMarkcleared: paymentDifference <= 0,
        })
        .eq("invId", invoice.invId);

      if (invoiceError) throw invoiceError;

      // Create ledger entry
      const { error: ledgerError } = await supabase
        .from("paymentLedger")
        .insert({
          invId: invoice.invId,
          transactionType: 'payment',
          amount: paymentAmount,
          runningBalance: paymentDifference,
          description: `Payment received via ${values.paymentMode}`,
        });

      if (ledgerError) throw ledgerError;

      toast({
        title: "Payment recorded",
        description: "The payment has been successfully recorded.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record payment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("paymentMode") === "cheque" && (
              <>
                <FormField
                  control={form.control}
                  name="chequeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cheque Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}