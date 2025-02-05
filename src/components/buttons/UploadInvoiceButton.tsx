import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function UploadInvoiceButton() {
  return (
    <Button variant="outline" className="flex items-center gap-2">
      <Upload className="h-4 w-4" />
      Upload Invoice
    </Button>
  );
}