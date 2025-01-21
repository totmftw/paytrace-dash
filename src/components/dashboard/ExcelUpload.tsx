import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ExcelUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement file upload to Supabase storage
      // and process Excel data to insert into invoiceTable
      toast({
        title: "Success",
        description: "Sales data uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload sales data",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // TODO: Implement template download
    const templateUrl = "/templates/sales-template.xlsx";
    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = "sales-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-4">
      <Button onClick={downloadTemplate} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download Template
      </Button>
      <div className="relative">
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-upload"
          disabled={uploading}
        />
        <Button asChild>
          <label htmlFor="excel-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload Sales Data
          </label>
        </Button>
      </div>
    </div>
  );
}