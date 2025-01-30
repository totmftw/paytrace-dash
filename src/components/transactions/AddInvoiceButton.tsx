import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddInvoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    // Add your form submission logic here
    toast({
      title: "Invoice Added",
      description: "Your invoice has been added"
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        Add Invoice
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <Form onSubmit={handleSubmit}>
            <FormField
              control={null}
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
            {/* Add all invoice fields here */}
            <Button type="submit">Submit</Button>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}