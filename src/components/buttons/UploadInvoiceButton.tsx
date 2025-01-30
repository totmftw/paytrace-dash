import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface UploadInvoiceButtonProps {
  tableName: 'invoiceTable' | 'paymentTransactions';
}

interface InvoiceData {
  invNumber: string;
  invValue: number;
  invGst: number;
  invTotal: number;
  invDate?: string;
  invDuedate?: string;
  invCustid?: number;
  invMessage1?: string;
  fy: string;
}

const UploadInvoiceButton = ({ tableName }: UploadInvoiceButtonProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as InvoiceData[];

        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const { error } = await supabase.from(tableName).insert(
            jsonData.map(item => ({
              ...item,
              fy: new Date().getFullYear().toString(),
              invGst: item.invGst || 0,
              invValue: item.invValue || 0,
              invTotal: item.invTotal || 0
            }))
          );
          if (error) throw error;

          toast({
            title: 'Success',
            description: 'File uploaded successfully',
          });
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button variant="ghost" asChild disabled={isUploading}>
      <label>
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
};

export default UploadInvoiceButton;