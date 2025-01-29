import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

export function InvoiceUploadButtons() {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
      });
      return;
    }

    // Add your file processing logic here
    toast({
      title: "Success",
      description: "File uploaded successfully",
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        CustomerName: 'Example Customer',
        InvoiceNumber: '2024-001',
        InvoiceDate: '2024-01-01',
        Amount: 1000,
        GSTAmount: 180,
        TotalAmount: 1180
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "invoice-template.xlsx");
  };

  return (
    <div className="flex items-center gap-4">
      <Button onClick={downloadTemplate} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download Template
      </Button>
      <div className="relative">
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="invoice-upload"
        />
        <Button asChild>
          <label htmlFor="invoice-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload Invoices
          </label>
        </Button>
      </div>
    </div>
  );
}