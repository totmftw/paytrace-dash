import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

type DownloadTemplateButtonProps = {
  tableName: 'invoiceTable' | 'paymentTransactions';
};

export function DownloadTemplateButton({ tableName }: DownloadTemplateButtonProps) {
  const { toast } = useToast();

  const generateTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) throw error;

      const headers = Object.keys(data[0]).map((key) => ({
        name: key,
        key,
      }));

      const ws = XLSX.utils.json_to_sheet([headers.reduce((acc, header) => ({ ...acc, [header.key]: header.name }), {})]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${tableName} Template`);
      XLSX.writeFile(wb, `${tableName} Template.xlsx`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate template',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="ghost" onClick={generateTemplate}>
      Download Template
    </Button>
  );
}