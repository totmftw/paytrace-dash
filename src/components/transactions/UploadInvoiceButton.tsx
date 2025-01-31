import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

interface InvoiceData {
  fy: string;
  invGst: number;
  invNumber: string;
  invTotal: number;
  invValue: number;
  invDate?: string;
  invDuedate?: string;
  invCustid?: number;
  invAddamount?: number;
  invSubamount?: number;
  invBalanceAmount?: number;
  invMarkcleared?: boolean;
  invMessage1?: string;
}

export function UploadInvoiceButton() {
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

          const { data: existingData, error: checkError } = await supabase
            .from("invoiceTable")
            .select("invNumber");

          if (checkError) throw checkError;

          const existingInvoices = existingData.map(inv => inv.invNumber);
          const newInvoices = (jsonData as InvoiceData[]).filter(
            row => !existingInvoices.includes(row.invNumber)
          );

          if (newInvoices.length > 0) {
            const formattedData = newInvoices.map((row: InvoiceData) => ({
              fy: row.fy || format(new Date(), 'yyyy'),
              invGst: Number(row.invGst) || 0,
              invNumber: String(row.invNumber),
              invTotal: Number(row.invTotal) || 0,
              invValue: Number(row.invValue) || 0,
              invDate: row.invDate ? format(new Date(row.invDate), 'yyyy-MM-dd') : undefined,
              invDuedate: row.invDuedate ? format(new Date(row.invDuedate), 'yyyy-MM-dd') : undefined,
              invCustid: Number(row.invCustid) || undefined,
              invAddamount: Number(row.invAddamount) || undefined,
              invSubamount: Number(row.invSubamount) || undefined,
              invBalanceAmount: Number(row.invBalanceAmount) || undefined,
              invMarkcleared: Boolean(row.invMarkcleared) || undefined,
              invMessage1: row.invMessage1 || undefined,
            }));

            const { error: insertError } = await supabase
              .from("invoiceTable")
              .insert(formattedData);

            if (insertError) throw insertError;

            toast({
              title: "Success",
              description: `Successfully uploaded ${formattedData.length} invoices`,
            });
          }
        } catch (error: any) {
          console.error("Upload error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to upload invoices",
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
        {isUploading ? "Uploading..." : "Upload Invoices"}
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