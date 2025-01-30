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
            custBusinessname: String(row.BusinessName || '').trim(),
            custOwnername: String(row.OwnerName || '').trim(),
            custPhone: Number(row.Phone) || 0,
            custWhatsapp: Number(row.WhatsApp) || 0,
            custOwnerphone: Number(row.OwnerPhone) || 0,
            custOwnerwhatsapp: Number(row.OwnerWhatsApp) || 0,
            custEmail: String(row.Email || '').trim(),
            custOwneremail: String(row.OwnerEmail || '').trim(),
            custType: String(row.Type || 'retail').trim(),
            custAddress: String(row.Address || '').trim(),
            custProvince: String(row.Province || '').trim(),
            custCity: String(row.City || '').trim(),
            custPincode: Number(row.Pincode) || null,
            custGST: String(row.GST || '0').trim(),
            custCreditperiod: Number(row.CreditPeriod) || 0,
            custRemarks: String(row.Remarks || '').trim(),
            custStatus: String(row.Status || 'active').trim()
          }));

          console.log("Processed customer data:", customers);

          // Get existing business names (case-insensitive)
          const { data: existingCustomers, error: fetchError } = await supabase
            .from('customerMaster')
            .select('custBusinessname');

          if (fetchError) {
            throw new Error(`Failed to fetch existing customers: ${fetchError.message}`);
          }

          const existingBusinessNames = new Set(
            existingCustomers?.map(c => c.custBusinessname.toLowerCase()) || []
          );

          // Filter out duplicates (case-insensitive)
          const newCustomers = customers.filter(customer => 
            !existingBusinessNames.has(customer.custBusinessname.toLowerCase())
          );

          const skippedCustomers = customers.length - newCustomers.length;

          if (newCustomers.length === 0) {
            toast({
              variant: "destructive",
              title: "No new customers added",
              description: "All business names in the file already exist in the database.",
            });
            return;
          }

          // Insert customers one by one for better error tracking
          const successfulInserts = [];
          const failedInserts = [];

          for (const customer of newCustomers) {
            const { error: insertError } = await supabase
              .from('customerMaster')
              .insert([customer]);

            if (insertError) {
              failedInserts.push({
                name: customer.custBusinessname,
                error: insertError.message
              });
            } else {
              successfulInserts.push(customer.custBusinessname);
            }
          }

          // Invalidate and refetch customers query
          await queryClient.invalidateQueries({ queryKey: ["customers"] });

          // Show appropriate toast messages
          if (successfulInserts.length > 0) {
            toast({
              title: "Success",
              description: `Successfully added ${successfulInserts.length} customers.${
                skippedCustomers > 0 ? ` ${skippedCustomers} duplicate entries were skipped.` : ''
              }`,
            });
          }

          if (failedInserts.length > 0) {
            toast({
              variant: "destructive",
              title: "Some insertions failed",
              description: `Failed to add ${failedInserts.length} customers. Please check the console for details.`,
            });
            console.error("Failed insertions:", failedInserts);
          }

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