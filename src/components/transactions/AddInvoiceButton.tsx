// src/pages/Transactions/buttons/AddInvoiceButton.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { columns } from "./TransactionInvoiceTable"; // Adjust import path as needed

export default function AddInvoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [formValues, setFormValues] = useState({});

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await supabase.from('invoiceTable').insert([{
        ...formValues,
        user_id: user.id,
      }]);
      toast({
        title: "Invoice Added",
        description: "Your invoice has been added",
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        Add Single Invoice
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Invoice</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {columns.map((column) => (
              <FormField
                key={column.accessorKey}
                name={column.accessorKey}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{column.header}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={column.header}
                        {...field}
                        onChange={(e) => {
                          setFormValues((prev) => ({
                            ...prev,
                            [column.accessorKey]: e.target.value,
                          }));
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}