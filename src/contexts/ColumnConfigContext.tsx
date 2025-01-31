import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (order: string[]) => Promise<void>;
}

const ColumnConfigContext = createContext<ColumnConfigContextType | undefined>(undefined);

export function ColumnConfigProvider({ children }: { children: ReactNode }) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { user } = useAuth();

  const setColumnOrder = async (newOrder: string[]) => {
    if (!user) return;
    setVisibleColumns(newOrder);
    
    await supabase
      .from('user_profiles')
      .update({ 
        preferences: { columns: newOrder } 
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
}

export function useColumnConfig() {
  const context = useContext(ColumnConfigContext);
  if (!context) {
    throw new Error('useColumnConfig must be used within ColumnConfigProvider');
  }
  return context;
}