// src/pages/Transactions/buttons/UploadInvoiceButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadInvoiceButtonProps {
  tableName: string;
}

export default function UploadInvoiceButton({ tableName }: UploadInvoiceButtonProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 1) {
          toast({
            title: "Error",
            description: "Invalid file format",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const headers = jsonData[0];
        const newData = jsonData.slice(1).map((row: any[]) => {
          const rowData: { [key: string]: any } = {
            user_id: user.id, // Add user_id to each row
          };
          headers.forEach((header: string, index: number) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        // Fetch existing data to check for duplicates
        const { data: existingData } = await supabase.from(tableName).select('*');
        const existingNumbers = existingData.map((item: any) => item.invNumber);

        const duplicates = newData.filter((item) => existingNumbers.includes(item.invNumber));

        if (duplicates.length > 0) {
          toast({
            title: "Duplicate Invoices",
            description: `Found ${duplicates.length} duplicates`,
            variant: "destructive",
          });
        }

        const uniqueData = newData.filter((item) => !existingNumbers.includes(item.invNumber));
        if (uniqueData.length > 0) {
          await supabase.from(tableName).insert(uniqueData);
          toast({
            title: "Upload Successful",
            description: `${uniqueData.length} invoices added`,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button variant="ghost" onClick={handleUpload} disabled={isLoading}>
        {isLoading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
}