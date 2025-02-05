// src/apis/layoutApi.ts
import { supabase } from "@/integrations/supabase/client";

export const saveLayoutToDatabase = async (payload: any) => {
  const { error } = await supabase.from("dashboard_layouts").upsert(payload);
  if (error) throw error;
};

