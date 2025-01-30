// src/pages/Transactions/buttons/PDFExport.tsx
import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";

interface PDFExportProps {
  data: any[];
  customer?: {
    businessName: string;
    address: string;
    GST: string;
    phone: string;
  };
}

export default function PDFExport({ data, customer }: PDFExportProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    
    // Add seller information
    doc.text("MKD Enterprises, Bengaluru", 10, 10);
    
    // Add buyer information
    if (customer) {
      doc.text(`Business Name: ${customer.businessName}`, 10, 20);
      doc.text(`Address: ${customer.address}`, 10, 25);
      doc.text(`GST: ${customer.GST}`, 10, 30);
      doc.text(`Phone: ${customer.phone}`, 10, 35);
    }

    // Add table headers and rows
    doc.autoTable({
      head: [["Date", "Description", "Amount", "Balance"]],
      body: data.map((row) => [
        row.date,
        row.description,
        `${row.amount}`,
        `${row.balance}`,
      ]),
    });
    
    doc.save("ledger.pdf");
  };

  return (
    <Button variant="ghost" onClick={handleExport}>
      Export to PDF
    </Button>
  );
}