import { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutContextType {
  saveLayout: (payload: any) => Promise<void>;
  resetLayout: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType>({
  saveLayout: async () => {},
  resetLayout: async () => {},
});

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const saveLayout = async (payload: any) => {
    if (!user) return;

    const { error } = await supabase
      .from("dashboard_layouts")
      .upsert({
        created_by: user.id,
        layout: payload,
        is_active: true,
      });

    if (error) {
      throw error;
    }
  };

  const resetLayout = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("dashboard_layouts")
      .delete()
      .eq("created_by", user.id);

    if (error) {
      throw error;
    }
  };

  return (
    <LayoutContext.Provider value={{ saveLayout, resetLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayouts = () => useContext(LayoutContext);