import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { useFinancialYear } from '@/contexts/FinancialYearContext';

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

interface DatabaseInvoice {
  invNumber: string;
}

const UploadInvoiceButton = ({ tableName }: UploadInvoiceButtonProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { selectedYear } = useFinancialYear();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as InvoiceData[];

          if (Array.isArray(jsonData) && jsonData.length > 0) {
            // Check for duplicates
            const { data: existingInvoices, error } = await supabase
              .from(tableName)
              .select('invNumber')
              .in('invNumber', jsonData.map(item => item.invNumber));

            if (error) {
              throw error;
            }

            if (existingInvoices && existingInvoices.length > 0) {
              const duplicateNumbers = (existingInvoices as DatabaseInvoice[])
                .map(inv => inv.invNumber)
                .filter(num => jsonData.some(item => item.invNumber === num));

              if (duplicateNumbers.length > 0) {
                toast({
                  title: 'Duplicates Found',
                  description: `Duplicate invoices detected: ${duplicateNumbers.join(', ')}`,
                  variant: 'destructive'
                });
                setIsUploading(false);
                return;
              }
            }

            // Proceed with insert if no duplicates
            const { error: insertError } = await supabase.from(tableName).insert(
              jsonData.map(item => ({
                ...item,
                fy: selectedYear 
              }))
            );
            
            if (insertError) throw insertError;

            toast({
              title: 'Success',
              description: 'File uploaded successfully',
            });
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: 'Error',
            description: 'Failed to process file',
            variant: 'destructive',
          });
        } finally {
          setIsUploading(false);
        }
      };

      fileReader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive',
      });
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