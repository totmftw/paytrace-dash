import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';

// Add the missing type for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFExportProps {
  data: any[];
}

export function PDFExport({ data }: PDFExportProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    
    doc.autoTable({
      head: [['Date', 'Description', 'Amount', 'Balance']],
      body: data.map(row => [
        new Date(row.date).toLocaleDateString(),
        row.description,
        formatCurrency(row.amount),
        formatCurrency(row.balance)
      ])
    });

    doc.save('ledger.pdf');
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      Export PDF
    </Button>
  );
}