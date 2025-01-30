import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type PDFExportProps = {
  data: {
    date: string;
    description: string;
    amount: number;
    balance: number;
  }[];
  customer?: {
    businessName: string;
    address: string;
    GST: string;
    phone: string;
  };
};

export default function PDFExport({ data, customer }: PDFExportProps) {
  const handleExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Ledger Report', 14, 10);
    doc.setFontSize(10);

    if (customer) {
      doc.text(`Customer: ${customer.businessName}`, 14, 18);
      doc.text(`Address: ${customer.address}`, 14, 22);
      doc.text(`GST: ${customer.GST}`, 14, 26);
      doc.text(`Phone: ${customer.phone}`, 14, 30);
    }

    const columns = ['Date', 'Description', 'Amount', 'Balance'];
    const rows = data.map((item) => [item.date, item.description, item.amount, item.balance]);

    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 35,
    });

    doc.save('ledger_report.pdf');
  };

  return (
    <Button variant="ghost" onClick={handleExport}>
      Export to PDF
    </Button>
  );
}