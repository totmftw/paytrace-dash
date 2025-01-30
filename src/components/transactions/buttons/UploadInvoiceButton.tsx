import React from "react";
import { Button } from "@/components/ui/button";
import { TableNames } from "@/types/types";

interface UploadInvoiceButtonProps {
  tableName: TableNames;
}

export function UploadInvoiceButton({ tableName }: UploadInvoiceButtonProps) {
  const handleUpload = async () => {
    // Add upload logic here
    console.log(`Uploading to ${tableName}`);
  };

  return (
    <Button variant="ghost" onClick={handleUpload}>
      Upload Invoice
    </Button>
  );
}