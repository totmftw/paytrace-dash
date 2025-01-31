// src/hooks/useUpload.ts
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useUploadData = (tableName: string) => {
  const { toast } = useToast();

  const upload = async (data: any[]) => {
    try {
      const existingRecords = await supabase.from(tableName).select(tableName + "Id, invNumber");
      const existingInvNumbers = new Set(existingRecords.data?.map(rec => rec.invNumber));

      const duplicates = data.filter(item => existingInvNumbers.has(item.invNumber));
      if (duplicates.length > 0) {
        throw new Error(`Duplicate invoices found: ${duplicates.map(d => d.invNumber).join(", ")}`);
      }

      await supabase.from(tableName).insert(data);
      toast({ title: "Success", description: "Data uploaded successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload data",
      });
    }
  };

  return { upload };
};