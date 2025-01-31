import { Button } from "@/components/ui/button";
import { TableName } from "@/types/types";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface TemplateDownloadProps {
  tableName: TableName;
  fileName: string;
}

export function TemplateDownload({ tableName, fileName }: TemplateDownloadProps) {
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) throw error;

      const template = data[0] ? 
        Object.keys(data[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {}) :
        {};

      const ws = XLSX.utils.json_to_sheet([template]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");

      // Set column widths
      const columnWidths = Object.keys(template).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = columnWidths;

      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Error generating template:", error);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      Download Template
    </Button>
  );
}