import React from "react";
import { Button } from "@/components/ui/button";

interface PDFExportProps {
  data: any[];
}

export function PDFExport({ data }: PDFExportProps) {
  const handleExport = () => {
    // Add PDF export logic here
    console.log('Exporting data:', data);
  };

  return (
    <Button variant="ghost" onClick={handleExport}>
      Export to PDF
    </Button>
  );
}