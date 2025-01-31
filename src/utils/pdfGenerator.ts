// src/utils/pdfGenerator.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface PDFData {
  seller: {
    name: string;
    address: string;
    gst: string;
  };
  buyer: {
    name: string;
    address: string;
    gst: string;
    phone: string;
  };
  entries: Array<{
    date: string;
    type: string;
    reference: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  year: string;
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
}

export const generatePDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add header
  doc.setFontSize(20);
  doc.text('Statement of Account', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Financial Year: ${data.year}`, pageWidth / 2, 30, { align: 'center' });

  // Add seller details
  doc.setFontSize(10);
  doc.text('From:', 15, 45);
  doc.text(data.seller.name, 15, 52);
  doc.text(data.seller.address, 15, 59);
  doc.text(`GSTIN: ${data.seller.gst}`, 15, 66);

  // Add buyer details
  doc.text('To:', pageWidth - 90, 45);
  doc.text(data.buyer.name, pageWidth - 90, 52);
  doc.text(data.buyer.address, pageWidth - 90, 59);
  doc.text(`GSTIN: ${data.buyer.gst}`, pageWidth - 90, 66);
  doc.text(`Phone: ${data.buyer.phone}`, pageWidth - 90, 73);

  // Add table
  doc.autoTable({
    startY: 85,
    head: [['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance']],
    body: data.entries.map(entry => [
      format(new Date(entry.date), 'dd/MM/yyyy'),
      entry.type,
      entry.reference,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      entry.balance.toFixed(2)
    ]),
    foot: [
      ['Total', '', '', 
        data.totalDebit.toFixed(2), 
        data.totalCredit.toFixed(2), 
        data.finalBalance.toFixed(2)
      ]
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [189, 195, 199] }
  });

  // Add footer
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.text('This is a computer generated statement and does not require signature.', 
    pageWidth / 2, finalY + 20, { align: 'center' });

  // Save PDF
  doc.save(`statement_${data.buyer.name}_${data.year}.pdf`);
};
