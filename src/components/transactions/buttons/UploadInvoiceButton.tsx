import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TableNames } from "@/types/types";

interface UploadInvoiceButtonProps {
  tableName: TableNames;
}

export function UploadInvoiceButton({ tableName }: UploadInvoiceButtonProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;

    toast({
      title: "Upload Successful",
      description: "Your file has been uploaded"
    });
  };

  return (
    <div className="flex items-center gap-4">
      <input 
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="ghost" asChild>
          <span>Choose File</span>
        </Button>
      </label>
      {file && (
        <Button variant="ghost" onClick={handleUpload}>
          Upload
        </Button>
      )}
    </div>
  );
}