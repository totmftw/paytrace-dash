import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

export function UploadInvoiceButton() {
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
          .from("invoiceTable")
          .select("invNumber");

        if (checkError) throw checkError;

        const existingInvNumbers = new Set(existingData.map(inv => inv.invNumber));
        const duplicates = jsonData.filter((row: any) => existingInvNumbers.has(row.invNumber));

        if (duplicates.length > 0) {
          toast({
            title: "Duplicate Invoices Found",
            description: `Found ${duplicates.length} duplicate invoice numbers. Please check and try again.`,
            variant: "destructive",
          });
          return;
        }

        const { error: uploadError } = await supabase
          .from("invoiceTable")
          .insert(jsonData);

        if (uploadError) throw uploadError;

        toast({
          title: "Success",
          description: `Successfully uploaded ${jsonData.length} invoices`,
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