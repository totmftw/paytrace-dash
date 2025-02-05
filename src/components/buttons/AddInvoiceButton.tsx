import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddInvoiceButton() {
  return (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Add Invoice
    </Button>
  );
}