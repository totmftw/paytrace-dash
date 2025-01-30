import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type AddInvoiceButtonProps = {
  tableName: 'invoiceTable' | 'paymentTransactions';
};

const formSchema = z.object({
  invNumber: z.string().min(1, { message: 'Invoice number is required' }),
  // Add all required fields here
});

export default function AddInvoiceButton({ tableName }: AddInvoiceButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invNumber: '',
      // Initialize other fields here
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await supabase.from(tableName).insert(values);
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
            <DialogTitle>Add {tableName === 'invoiceTable' ? 'Invoice' : 'Payment'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
              {/* Add other fields similarly */}
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}