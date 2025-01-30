import React from "react";
import { Button } from "@/components/ui/button";
import { generateTemplateFromTable } from "@/utils/templateUtils";
import { TableNames } from "@/types/types";

interface DownloadTemplateButtonProps {
  tableName: TableNames;
}

export default function DownloadTemplateButton({ tableName }: DownloadTemplateButtonProps) {
  return (
    <Button 
      variant="ghost"
      onClick={() => generateTemplateFromTable(tableName)}
    >
      Download Template
    </Button>
  );
}