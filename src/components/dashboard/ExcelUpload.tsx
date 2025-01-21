import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export function ExcelUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate required fields before processing
        const validatedSales = jsonData.map((row: any) => {
          if (!row.CustomerId) {
            throw new Error('CustomerId is required for all entries');
          }

          return {
            invCustid: parseInt(row.CustomerId),
            invNumber: [Date.now()], // Generate unique invoice number
            invDate: row.Date || new Date().toISOString(),
            invDuedate: row.DueDate,
            invValue: Number(row.Value) || 0,
            invGst: Number(row.GST) || 0,
            invAddamount: Number(row.AdditionalAmount) || 0,
            invSubamount: Number(row.SubtractAmount) || 0,
            invTotal: Number(row.Total) || 0,
            invMarkcleared: false,
            invMessage1: row.Message1 || '',
            invMessage2: row.Message2 || '',
            invMessage3: row.Message3 || ''
          };
        });

        const { error } = await supabase
          .from('invoiceTable')
          .insert(validatedSales);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Sales data uploaded successfully",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload sales data",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        CustomerId: '1',
        InvoiceNumber: 'INV001',
        Date: '2024-01-21',
        DueDate: '2024-02-21',
        Value: '1000',
        GST: '180',
        AdditionalAmount: '0',
        SubtractAmount: '0',
        Total: '1180',
        Message1: 'Initial invoice',
        Message2: '',
        Message3: ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "sales-template.xlsx");
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
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-upload"
          disabled={uploading}
        />
        <Button asChild disabled={uploading}>
          <label htmlFor="excel-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Sales Data"}
          </label>
        </Button>
      </div>
    </div>
  );
}