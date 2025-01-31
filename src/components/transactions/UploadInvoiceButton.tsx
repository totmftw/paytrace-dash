import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface UploadInvoiceButtonProps {
  tableName: string;
}

export function UploadInvoiceButton({ tableName }: UploadInvoiceButtonProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any[]>([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

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
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (tableName === 'invoiceTable' || tableName === 'paymentTransactions') {
          const { data: existingData, error } = await supabase
            .from(tableName)
            .select(tableName !== 'invoiceTable' ? 'transactionId' : 'invNumber');

          if (error) {
            toast({
              title: 'Error',
              description: 'Failed to check for duplicates',
              variant: 'destructive',
            });
            setIsUploading(false);
            return;
          }

          const existingItems = existingData?.map((item) => 
            tableName === 'invoiceTable' ? item.invNumber : item.transactionId
          ) || [];

          const duplicates = jsonData.filter((row: any) => 
            existingItems.includes(tableName === 'invoiceTable' ? row.invNumber : row.transactionId)
          );
          const newItems = jsonData.filter((row: any) => 
            !existingItems.includes(tableName === 'invoiceTable' ? row.invNumber : row.transactionId)
          );

          if (duplicates.length > 0) {
            setDuplicateData(duplicates);
            setIsDuplicateModalOpen(true);
          }

          if (newItems.length > 0) {
            const { error } = await supabase.from(tableName).insert(newItems);
            if (error) throw error;
            toast({
              title: 'Success',
              description: `Successfully uploaded ${newItems.length} new records`,
            });
          }
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
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
    <>
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

      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent>
          <DialogTitle>Duplicate Records Found</DialogTitle>
          <div>
            {duplicateData.map((row, index) => (
              <div key={index} className="border-b py-2">
                <p>{`Record ${index + 1}: ${JSON.stringify(row)}`}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}