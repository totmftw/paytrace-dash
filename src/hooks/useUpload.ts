import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUploadData = <T extends Record<string, any>>(tableName: keyof Database['public']['Tables']) => {
  const { toast } = useToast();

  const upload = async (data: T[]) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .insert(data);

      if (error) throw error;

      toast({ title: "Success", description: "Data uploaded successfully" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload data",
      });
    }
  };

  return { upload };
};