// src/pages/Transactions/buttons/UploadInvoiceButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

export default function UploadInvoiceButton({ tableName }: { tableName: string }) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result as ArrayBuffer;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      try {
        // Fetch existing data to check for duplicates
        const { data: existingData } = await supabase.from(tableName).select('*');
        
        const newData = jsonData.slice(1).map((row: any[]) => {
          const rowData: { [key: string]: any } = {};
          jsonData[0].forEach((header: string, index: number) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        const duplicates = newData.filter(item => 
          existingData.some(existing => 
            existing.invNumber === item.invNumber
          )
        );

        if (duplicates.length > 0) {
          toast({
            title: "Duplicate Invoices",
            description: `Found ${duplicates.length} duplicates`,
            variant: "destructive"
          });
        } else {
          await supabase.from(tableName).insert(newData);
          toast({
            title: "Upload Successful",
            description: "Your file has been uploaded"
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex items-center gap-4">
      <input 
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button variant="ghost" onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
}