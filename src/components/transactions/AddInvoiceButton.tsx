// src/pages/Transactions/buttons/AddInvoiceButton.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddInvoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    try {
      const { data, error } = await supabase.from('invoiceTable').insert([formData]);
      if (error) throw error;
      toast({
        title: "Invoice Added",
        description: "Your invoice has been added"
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        Add Invoice
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {/* Dynamically generate form fields based on invoiceTable schema */}
            <FormField
              name="invNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Invoice Number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Include all invoiceTable columns */}
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}