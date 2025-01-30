import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface PDFExportProps {
  data: any[];
}

export default function PDFExport({ data }: PDFExportProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.autoTable({ head: [['Invoice', 'Customer']], body: data });
    doc.save("ledger.pdf");
  };

  return (
    <Button variant="ghost" onClick={handleExport}>
      Export to PDF
    </Button>
  );
}