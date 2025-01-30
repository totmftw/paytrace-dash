import React from "react";
import { Button } from "@/components/ui/button";
import { generateTemplateFromTable } from "@/utils/templateUtils";
import { TableNames } from "@/types/types";
import { useToast } from "@/hooks/use-toast";

interface DownloadTemplateButtonProps {
  tableName: TableNames;
}

export default function DownloadTemplateButton({ tableName }: DownloadTemplateButtonProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      await generateTemplateFromTable(tableName);
      toast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download template",
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDownload}
      className="bg-[#98D8AA] text-[#1B4332] hover:bg-[#75C2A0]"
    >
      Download Template
    </Button>
  );
}