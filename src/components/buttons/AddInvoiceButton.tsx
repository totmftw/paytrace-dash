import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AddInvoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add invoice submission logic here
    setIsOpen(false);
    toast({
      title: "Success",
      description: "Invoice added successfully",
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Invoice</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Add form fields here */}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}