// src/pages/Transactions/buttons/DownloadTemplateButton.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { generateTemplateFromTable } from "@/utils/templateUtils";

interface DownloadTemplateButtonProps {
  tableName: string;
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