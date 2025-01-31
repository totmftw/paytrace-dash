import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface UploadDataButtonProps {
  tableName: "invoiceTable" | "paymentTransactions";
}

export default function UploadDataButton({ tableName }: UploadDataButtonProps) {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const { data: existingData, error: checkError } = await supabase
          .from(tableName)
          .select("*");

        if (checkError) throw checkError;

        // Check for duplicates
        const duplicates = jsonData.filter((newRow: any) => 
          existingData?.some((existingRow: any) => 
            (tableName === "invoiceTable" && existingRow.invNumber === newRow.invNumber) ||
            (tableName === "paymentTransactions" && existingRow.transactionId === newRow.transactionId)
          )
        );

        if (duplicates.length > 0) {
          toast({
            title: "Duplicate Entries Found",
            description: `Found ${duplicates.length} duplicate entries. Please check and try again.`,
            variant: "destructive",
          });
          return;
        }

        const { error: uploadError } = await supabase
          .from(tableName)
          .insert(jsonData);

        if (uploadError) throw uploadError;

        toast({
          title: "Success",
          description: `Successfully uploaded ${jsonData.length} records`,
        });
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" asChild>
      <label className="cursor-pointer">
        Upload Excel
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