import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { useQueryClient } from "@tanstack/react-query";

export function CustomerExcelUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log("Starting file upload process...");
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("Parsed Excel data:", jsonData);

          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error("No valid data found in the Excel file");
          }

          // Process and validate each row
          const customers = jsonData.map((row: any) => ({
            custBusinessname: row.BusinessName || '',
            custOwnername: row.OwnerName || '',
            custPhone: Number(row.Phone) || 0,
            custWhatsapp: Number(row.WhatsApp) || 0,
            custOwnerphone: Number(row.OwnerPhone) || 0,
            custOwnerwhatsapp: Number(row.OwnerWhatsApp) || 0,
            custEmail: row.Email || '',
            custOwneremail: row.OwnerEmail || '',
            custType: row.Type || 'retail',
            custAddress: row.Address || '',
            custProvince: row.Province || '',
            custCity: row.City || '',
            custPincode: Number(row.Pincode) || null,
            custGST: row.GST || '0',
            custCreditperiod: Number(row.CreditPeriod) || 0,
            custRemarks: row.Remarks || '',
            custStatus: row.Status || 'active'
          }));

          console.log("Processed customer data:", customers);

          // Insert data into Supabase one by one to better handle errors
          const results = [];
          const errors = [];

          for (const customer of customers) {
            try {
              const { data: insertedData, error } = await supabase
                .from('customerMaster')
                .insert([customer])
                .select()
                .single();

              if (error) {
                if (error.code === '23505') {
                  errors.push(`Business "${customer.custBusinessname}" already exists`);
                } else {
                  errors.push(`Error adding "${customer.custBusinessname}": ${error.message}`);
                }
              } else if (insertedData) {
                results.push(insertedData);
              }
            } catch (error: any) {
              errors.push(`Failed to process "${customer.custBusinessname}": ${error.message}`);
            }
          }

          // Show success/error messages
          if (results.length > 0) {
            toast({
              title: "Success",
              description: `Successfully uploaded ${results.length} customer records`,
            });
          }

          if (errors.length > 0) {
            toast({
              variant: "destructive",
              title: "Some records failed",
              description: errors.join('\n'),
            });
          }

          // Invalidate and refetch customers query
          await queryClient.invalidateQueries({ queryKey: ["customers"] });

        } catch (error: any) {
          console.error("Processing error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to process customer data",
          });
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to read the Excel file",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload customer data",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        BusinessName: 'Example Business Name',
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
    
    // Add column widths for better readability
    ws['!cols'] = [
      { wch: 20 }, // BusinessName
      { wch: 15 }, // OwnerName
      { wch: 12 }, // Phone
      { wch: 12 }, // WhatsApp
      { wch: 12 }, // OwnerPhone
      { wch: 12 }, // OwnerWhatsApp
      { wch: 25 }, // Email
      { wch: 25 }, // OwnerEmail
      { wch: 10 }, // Type
      { wch: 30 }, // Address
      { wch: 15 }, // Province
      { wch: 15 }, // City
      { wch: 10 }, // Pincode
      { wch: 15 }, // GST
      { wch: 12 }, // CreditPeriod
      { wch: 30 }, // Remarks
      { wch: 10 }  // Status
    ];

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