import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { useQueryClient } from '@tanstack/react-query';

interface ExcelUploadProps {
  uploadType: "invoice" | "payment" | "customer";
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({ uploadType }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "The Excel file is empty",
          });
          return;
        }

        let tableName = '';
        switch (uploadType) {
          case 'invoice':
            tableName = 'invoiceTable';
            break;
          case 'payment':
            tableName = 'paymentTransactions';
            break;
          case 'customer':
            tableName = 'customerMaster';
            break;
        }

        const { error } = await supabase
          .from(tableName)
          .insert(jsonData);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Data uploaded successfully",
        });

        // Invalidate relevant queries
        queryClient.invalidateQueries([uploadType + 's']);

      };
      reader.readAsBinaryString(file);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload data. Please check the file format and try again.",
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="excel-upload"
      />
      <label htmlFor="excel-upload">
        <Button
          component="span"
          disabled={isUploading}
          variant="outline"
        >
          {isUploading ? "Uploading..." : "Upload Excel"}
        </Button>
      </label>
    </div>
  );
};