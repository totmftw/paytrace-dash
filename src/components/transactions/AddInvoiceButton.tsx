import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  invNumber: z.string().min(1, "Invoice number is required"),
  invValue: z.number().min(0, "Value must be positive"),
  invGst: z.number().min(0, "GST must be positive"),
  invAddamount: z.number().optional(),
  invSubamount: z.number().optional(),
  invCustid: z.number().min(1, "Customer is required"),
  invDate: z.string().min(1, "Date is required"),
  invDuedate: z.string().min(1, "Due date is required"),
});

export function AddInvoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invValue: 0,
      invGst: 0,
      invAddamount: 0,
      invSubamount: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from("invoiceTable")
        .insert([{
          ...data,
          invTotal: data.invValue + data.invGst + 
            (data.invAddamount || 0) - (data.invSubamount || 0),
          invBalanceAmount: 0,
          invPaymentStatus: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice added successfully",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add invoice",
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="bg-[#98D8AA] text-[#1B4332] hover:bg-[#75C2A0]"
      >
        Add Invoice
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Invoice</DialogTitle>
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
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Add other form fields here */}
              
              <Button 
                type="submit"
                className="bg-[#98D8AA] text-[#1B4332] hover:bg-[#75C2A0]"
              >
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}