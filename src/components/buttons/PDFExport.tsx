import { Button } from "@/components/ui/button";

export interface PDFExportProps {
  onClick?: () => void;
  children?: React.ReactNode;
  data?: any[];
  fileName?: string;
}

export function PDFExport({ onClick, children, data, fileName }: PDFExportProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      {children || "Export PDF"}
    </Button>
  );
}