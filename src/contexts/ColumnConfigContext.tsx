import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (order: string[]) => Promise<void>;
}

const ColumnConfigContext = createContext<ColumnConfigContextType | undefined>(undefined);

export const ColumnConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchColumns = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (data?.preferences?.columns) {
        setVisibleColumns(data.preferences.columns);
      }
    };
    fetchColumns();
  }, [user]);

  const setColumnOrder = async (newOrder: string[]) => {
    if (!user) return;
    setVisibleColumns(newOrder);
    await supabase
      .from('user_profiles')
      .update({ 
        preferences: { 
          columns: newOrder 
        } 
      })
      .eq('id', user.id);
  };

  return (
    <ColumnConfigContext.Provider value={{ 
      visibleColumns, 
      setVisibleColumns,
      setColumnOrder 
    }}>
      {children}
    </ColumnConfigContext.Provider>
  );
};

export const useColumnConfig = () => {
  const context = useContext(ColumnConfigContext);
  if (!context) {
    throw new Error('useColumnConfig must be used within a ColumnConfigProvider');
  }
  return context;
};