import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadTemplateButtonProps {
  tableName: string;
}

export function DownloadTemplateButton({ tableName }: DownloadTemplateButtonProps) {
  return (
    <Button variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
}