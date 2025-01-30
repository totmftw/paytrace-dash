import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface UploadInvoiceButtonProps {
  tableName: string;
}

export default function UploadInvoiceButton({ tableName }: UploadInvoiceButtonProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;

    // Add your upload logic here
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
      />
      <Button variant="ghost" onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
}