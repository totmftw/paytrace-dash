import React from "react";
import { Button } from "@/components/ui/button";
import { TableNames } from "@/types/types";

interface DownloadTemplateButtonProps {
  tableName: TableNames;
}

export function DownloadTemplateButton({ tableName }: DownloadTemplateButtonProps) {
  const handleDownload = async () => {
    // Add download logic here
    console.log(`Downloading template for ${tableName}`);
  };

  return (
    <Button variant="ghost" onClick={handleDownload}>
      Download Template
    </Button>
  );
}