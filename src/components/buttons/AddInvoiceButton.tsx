import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFinancialYear } from '@/contexts/FinancialYearContext';

const formSchema = z.object({
  invNumber: z.string().min(1, { message: 'Invoice number is required' }),
  invValue: z.number().min(0),
  invGst: z.number().min(0),
  invTotal: z.number().min(0),
  invDate: z.string(),
  invDuedate: z.string(),
  invCustid: z.number().optional(),
  invMessage1: z.string().default(''),
});

export default function AddInvoiceButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { selectedYear } = useFinancialYear();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invNumber: '',
      invValue: 0,
      invGst: 0,
      invTotal: 0,
      invDate: new Date().toISOString().split('T')[0],
      invDuedate: new Date().toISOString().split('T')[0],
      invMessage1: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.from('invoiceTable').insert({
        ...values,
        fy: selectedYear,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice added successfully',
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to add invoice',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Add Single Invoice
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Invoice</DialogTitle>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="invValue"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invGst"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>GST</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}