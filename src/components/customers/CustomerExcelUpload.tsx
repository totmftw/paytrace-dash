import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export function CustomerExcelUpload() {
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

        // Process and validate each row
        const customers = jsonData.map((row: any) => ({
          custBusinessname: row.BusinessName ?? '',
          custOwnername: row.OwnerName ?? '',
          custPhone: Number(row.Phone) || 0,
          custWhatsapp: Number(row.WhatsApp) || 0,
          custOwnerphone: Number(row.OwnerPhone) || 0,
          custOwnerwhatsapp: Number(row.OwnerWhatsApp) || 0,
          custEmail: row.Email ?? '',
          custOwneremail: row.OwnerEmail ?? '',
          custType: [row.Type ?? 'retail'],
          custAddress: row.Address ?? '',
          custProvince: row.Province ?? '',
          custCity: row.City ?? '',
          custPincode: Number(row.Pincode) || null,
          custGST: Number(row.GST) || 0,
          custCreditperiod: [Number(row.CreditPeriod) || 0],
          custRemarks: row.Remarks ?? '',
          custStatus: [row.Status ?? 'active']
        }));

        // Insert data into Supabase
        const { error } = await supabase
          .from('customerMaster')
          .insert(customers);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer data uploaded successfully",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload customer data",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        BusinessName: 'Example Business',
        OwnerName: 'John Doe',
        Phone: '1234567890',
        WhatsApp: '1234567890',
        OwnerPhone: '9876543210',
        OwnerWhatsApp: '9876543210',
        Email: 'business@example.com',
        OwnerEmail: 'owner@example.com',
        Type: 'retail',
        Address: '123 Main St',
        Province: 'Example Province',
        City: 'Example City',
        Pincode: '123456',
        GST: '123456789',
        CreditPeriod: '30',
        Remarks: 'Example remarks',
        Status: 'active'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "customer-template.xlsx");
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
          id="customer-excel-upload"
          disabled={uploading}
        />
        <Button asChild disabled={uploading}>
          <label htmlFor="customer-excel-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Customer Data"}
          </label>
        </Button>
      </div>
    </div>
  );
}