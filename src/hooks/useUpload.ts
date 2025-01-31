import { supabase } from '@/integrations/supabase/client';
import type { TableName } from '@/types/types';

export const useUpload = () => {
  const uploadData = async <T extends Record<string, any>>(
    tableName: TableName,
    data: T[]
  ) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .insert(data as any); // Type assertion needed due to dynamic table structure

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error };
    }
  };

  return { uploadData };
};