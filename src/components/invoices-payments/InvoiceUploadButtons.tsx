import { Button } from "@/components/ui/button";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { useNavigate } from "react-router-dom";

export function InvoiceUploadButtons() {
  const navigate = useNavigate();
  
  return (
    <div className="flex gap-4">
      <Button>Download Template</Button>
      <ExcelUpload uploadType="invoice" />
      <Button onClick={() => navigate("/invoices/new")}>Add Invoice</Button>
    </div>
  );
}