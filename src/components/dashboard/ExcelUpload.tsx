import { useState } from "react";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface ExcelUploadProps {
  uploadType: "invoice" | "payment" | "customer";
}

export function ExcelUpload({ uploadType }: ExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);

          if (!Array.isArray(parsedData) || parsedData.length === 0) {
            throw new Error("No data found in Excel file");
          }

          const tableName = getTableName(uploadType);
          const { error } = await supabase
            .from(tableName)
            .insert(parsedData as any);

          if (error) throw error;

          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: [tableName] });

          toast({
            title: "Upload Successful",
            description: `${parsedData.length} records have been uploaded successfully.`,
          });
        } catch (error) {
          console.error("Upload error:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "Failed to upload data",
          });
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("File reading error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the Excel file",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const getTableName = (type: ExcelUploadProps["uploadType"]) => {
    switch (type) {
      case "invoice":
        return "invoiceTable";
      case "payment":
        return "paymentTransactions";
      case "customer":
        return "customerMaster";
      default:
        throw new Error("Invalid upload type");
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
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </Button>
  );
}