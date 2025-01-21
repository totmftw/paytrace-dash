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
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  amount: z.number().min(0, "Amount cannot be negative"),
  gst: z.number().min(0, "GST cannot be negative"),
  dueDate: z.string().min(1, "Due date is required"),
});

type FormData = z.infer<typeof formSchema>;

export function NewSaleForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      amount: 0,
      gst: 0,
    },
  });

  const generateInvoiceNumber = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear() % 100; // Get last 2 digits of year
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Get the latest invoice number for this month
      const { data: latestInvoices } = await supabase
        .from('invoiceTable')
        .select('invNumber')
        .order('invNumber', { ascending: false })
        .limit(1);

      let sequence = 1;
      if (latestInvoices && latestInvoices.length > 0 && Array.isArray(latestInvoices[0].invNumber)) {
        const lastInvoiceNumber = latestInvoices[0].invNumber[1];
        if (typeof lastInvoiceNumber === 'number') {
          const lastSequence = lastInvoiceNumber % 10000;
          sequence = lastSequence + 1;
        }
      }

      const sequenceStr = sequence.toString().padStart(4, '0');
      const timestamp = Date.now();
      const monthlyNumber = parseInt(`${year}${month}${sequenceStr}`);
      
      return [timestamp, monthlyNumber];
    } catch (error) {
      console.error("Error generating invoice number:", error);
      throw error;
    }
  };

  const { data: customers, isError: isCustomersError } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        console.log("Fetching customers...");
        const { data, error } = await supabase
          .from("customerMaster")
          .select("id, custBusinessname")
          .throwOnError();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Customers fetched successfully:", data);
        return data;
      } catch (err: any) {
        console.error("Customer fetch error:", err);
        toast({
          variant: "destructive",
          title: "Error loading customers",
          description: "Please check your connection and try again"
        });
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: products, isError: isProductsError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productManagement")
        .select("prodId, prodName, prodBasePrice");
      if (error) throw error;
      return data;
    },
    retry: 3,
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Verify customer exists before creating invoice
      const { data: customerExists, error: customerError } = await supabase
        .from("customerMaster")
        .select("id")
        .eq("id", parseInt(data.customerId))
        .single();

      if (customerError || !customerExists) {
        throw new Error("Selected customer does not exist");
      }

      const invoiceNumber = await generateInvoiceNumber();
      
      const { error } = await supabase.from("invoiceTable").insert({
        invCustid: parseInt(data.customerId),
        invNumber: invoiceNumber,
        invDate: new Date().toISOString(),
        invDuedate: data.dueDate,
        invValue: data.amount,
        invGst: data.gst,
        invTotal: data.amount + data.gst,
        invMessage1: "New sale entry",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New sale entry created successfully",
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Sale creation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create sale entry",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Sale Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Sale Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id.toString()}
                        >
                          {customer.custBusinessname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const product = products?.find((p) => p.prodId === value);
                      if (product) {
                        form.setValue("amount", product.prodBasePrice);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.prodId} value={product.prodId}>
                          {product.prodName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseInt(e.target.value));
                        const product = products?.find(
                          (p) => p.prodId === form.getValues("productId")
                        );
                        if (product) {
                          form.setValue(
                            "amount",
                            product.prodBasePrice * parseInt(e.target.value)
                          );
                        }
                      }}
                    />
                  </FormControl>
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
                    <Input type="number" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={!customers}>
              Create Sale Entry
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
