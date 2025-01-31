import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  toggleColumn: (columnId: string) => void;
  reorderColumns: (startIndex: number, endIndex: number) => void;
}

const ColumnConfigContext = createContext<ColumnConfigContextType | undefined>(undefined);

export function ColumnConfigProvider({ children }: { children: ReactNode }) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadConfig = async () => {
      if (!user?.id) return;

      const { data: config } = await supabase
        .from('dashboard_config')
        .select('layout')
        .eq('user_id', user.id)
        .single();

      if (config?.layout) {
        const savedColumns = config.layout.columns || [];
        setVisibleColumns(savedColumns);
      }
    };

    loadConfig();
  }, [user?.id]);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const reorderColumns = (startIndex: number, endIndex: number) => {
    setVisibleColumns(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  return (
    <ColumnConfigContext.Provider value={{
      visibleColumns,
      setVisibleColumns,
      toggleColumn,
      reorderColumns
    }}>
      {children}
    </ColumnConfigContext.Provider>
  );
}

export function useColumnConfig() {
  const context = useContext(ColumnConfigContext);
  if (context === undefined) {
    throw new Error('useColumnConfig must be used within a ColumnConfigProvider');
  }
  return context;
}