// src/components/buttons/UploadInvoiceButton.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { toTitleCase } from "@/utils/utils";

export interface ColumnMeta {
  label: string;
  key: string;
  type?: "string" | "number" | "date";
}

interface Props {
  columns: ColumnMeta[];
  tableName: string;
}

export const DownloadTemplateButton = ({ columns, tableName }: Props) => {
  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(columns.map(col => ({ [col.label]: "" })));
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
    XLSX.writeFile(workbook, `${tableName}_template.xlsx`);
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      Download Template
    </Button>
  );
};