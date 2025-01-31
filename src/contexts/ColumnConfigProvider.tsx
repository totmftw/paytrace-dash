import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ColumnConfigContextType {
  visibleColumns: string[];
  setColumnOrder: (order: string[]) => void;
}

const ColumnConfigContext = createContext<ColumnConfigContextType>({
  visibleColumns: [],
  setColumnOrder: () => {},
});

export const useColumnConfig = () => {
  const context = useContext(ColumnConfigContext);
  if (!context) {
    throw new Error('useColumnConfig must be used within a ColumnConfigProvider');
  }
  return context;
};

export const ColumnConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserColumns = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("preferences")
        .eq("id", user.id)
        .single();
      
      if (data?.preferences?.columns) {
        setVisibleColumns(data.preferences.columns);
      }
    };

    fetchUserColumns();
  }, [user]);

  const handleColumnOrder = async (newOrder: string[]) => {
    if (!user) return;
    
    setVisibleColumns(newOrder);
    
    await supabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        preferences: { columns: newOrder }
      });
  };

  return (
    <ColumnConfigContext.Provider value={{ 
      visibleColumns, 
      setColumnOrder: handleColumnOrder 
    }}>
      {children}
    </ColumnConfigContext.Provider>
  );
};