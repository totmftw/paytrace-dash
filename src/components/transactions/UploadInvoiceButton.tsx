import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

type UploadInvoiceButtonProps = {
  tableName: 'invoiceTable' | 'paymentTransactions';
};

export default function UploadInvoiceButton({ tableName }: UploadInvoiceButtonProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extract headers and data rows
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Format data rows into objects with headers as keys
        const formattedData = rows.map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });

        // Get existing data to check for duplicates
        const { data: existingData } = await supabase.from(tableName).select();

        // Define unique key (modify if needed)
        const primaryKey = tableName === 'invoiceTable' ? 'invNumber' : 'transactionId';

        // Check for duplicates
        const existingKeys = new Set(existingData?.map((item: any) => item[primaryKey]) || []);
        const duplicates = formattedData.filter((item: any) => existingKeys.has(item[primaryKey]));
        const uniqueData = formattedData.filter((item: any) => !existingKeys.has(item[primaryKey]));

        if (duplicates.length > 0) {
          toast({
            title: 'Duplicate Entries',
            description: `Found ${duplicates.length} duplicate entries`,
            variant: 'destructive',
          });
        }

        if (uniqueData.length > 0) {
          await supabase.from(tableName).insert(uniqueData);
          toast({
            title: 'Upload Successful',
            description: `Added ${uniqueData.length} new entries`,
          });
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while processing the file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button variant="ghost" onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
}