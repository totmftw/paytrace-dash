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
// src/components/buttons/PDFExport.ts
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

export const PDFExport = ({ data }: { data: any[] }) => {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.autoTable({
      styles: { overflow: "linebreak" },
      columnStyles: { amount: { halign: "right" } },
      theme: "striped",
      body: data.map(row => ({
        date: new Date(row.date).toLocaleDateString(),
        description: row.description,
        reference: row.type === "credit" ? row.transactionId : row.invoiceNumber,
        amount: formatCurrency(row.amount),
        balance: formatCurrency(row.balance),
      })),
    });
    doc.save("ledger.pdf");
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      Export Ledger PDF
    </Button>
  );
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

    doc.autoTable({
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