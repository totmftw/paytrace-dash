import { Button } from "@/components/ui/button";

export interface PDFExportProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export function PDFExport({ onClick, children }: PDFExportProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      {children || "Export PDF"}
    </Button>
  );
}