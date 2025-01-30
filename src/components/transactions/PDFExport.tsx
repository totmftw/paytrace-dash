import React from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { formatCurrency } from "@/lib/utils";
import { LedgerEntry } from "@/types/types";

interface PDFExportProps {
  data: LedgerEntry[];
  customerInfo?: {
    businessName: string;
    address: string;
    gst: string;
    phone: string;
  };
}

export default function PDFExport({ data, customerInfo }: PDFExportProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(16);
    doc.text("MKD Enterprises", 20, 20);
    doc.setFontSize(12);
    doc.text("Bengaluru", 20, 30);

    if (customerInfo) {
      doc.text("Customer Details:", 20, 45);
      doc.text(`Business Name: ${customerInfo.businessName}`, 20, 55);
      doc.text(`Address: ${customerInfo.address}`, 20, 65);
      doc.text(`GST: ${customerInfo.gst}`, 20, 75);
      doc.text(`Phone: ${customerInfo.phone}`, 20, 85);
    }

    // Add table headers
    let yPos = customerInfo ? 100 : 45;
    const headers = ["Date", "Description", "Reference", "Debit", "Credit", "Balance"];
    const columnWidths = [30, 50, 30, 25, 25, 30];
    let xPos = 20;

    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos);
      xPos += columnWidths[i];
    });

    yPos += 10;

    // Add table data
    data.forEach((entry) => {
      xPos = 20;
      
      // Date
      doc.text(new Date(entry.date).toLocaleDateString(), xPos, yPos);
      xPos += columnWidths[0];
      
      // Description
      doc.text(entry.description, xPos, yPos);
      xPos += columnWidths[1];
      
      // Reference
      doc.text(entry.reference, xPos, yPos);
      xPos += columnWidths[2];
      
      // Debit/Credit
      if (entry.transactionType === "invoice") {
        doc.text(formatCurrency(entry.amount), xPos, yPos);
        xPos += columnWidths[3];
        doc.text("-", xPos, yPos);
      } else {
        doc.text("-", xPos, yPos);
        xPos += columnWidths[3];
        doc.text(formatCurrency(entry.amount), xPos, yPos);
      }
      xPos += columnWidths[4];
      
      // Balance
      doc.text(formatCurrency(entry.balance), xPos, yPos);
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save("ledger.pdf");
  };

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF}
      className="bg-[#98D8AA] text-[#1B4332] hover:bg-[#75C2A0]"
    >
      Export PDF
    </Button>
  );
}