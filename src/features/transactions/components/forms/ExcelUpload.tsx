import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  tableName: string;
  onSuccess: () => void;
  validateRow?: (row: any) => boolean;
  transformRow?: (row: any) => any;
}

export function ExcelUpload({
  tableName,
  onSuccess,
  validateRow = () => true,
  transformRow = (row) => row,
}: ExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error("No valid data found in the Excel file");
          }

          const validData = jsonData
            .filter(validateRow)
            .map(transformRow);

          if (validData.length === 0) {
            throw new Error("No valid rows found in the Excel file");
          }

          const { error } = await supabase
            .from(tableName)
            .insert(validData);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Successfully uploaded ${validData.length} records`,
          });

          onSuccess();
        } catch (error: any) {
          console.error("Upload error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to upload file",
          });
        }
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      console.error("File reading error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the Excel file",
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <Button
      variant="outline"
      disabled={isUploading}
      asChild
    >
      <label className="cursor-pointer">
        {isUploading ? "Uploading..." : "Upload Excel"}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </Button>
  );
}