import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (columns: string[]) => void;
}

const ColumnConfigContext = createContext<ColumnConfigContextType>({
  visibleColumns: [],
  setVisibleColumns: () => {},
  setColumnOrder: () => {},
});

export const useColumnConfig = () => {
  const context = useContext(ColumnConfigContext);
  if (!context) {
    throw new Error('useColumnConfig must be used within a ColumnConfigProvider');
  }
  return context;
};

export const ColumnConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;

      const { data: config } = await supabase
        .from('invoice_table_config')
        .select('visible_columns')
        .eq('user_id', user.id)
        .single();

      if (config?.visible_columns) {
        setVisibleColumns(config.visible_columns);
      }
    };

    fetchConfig();
  }, [user]);

  const handleSetColumnOrder = async (columns: string[]) => {
    if (!user) return;

    setVisibleColumns(columns);

    await supabase
      .from('invoice_table_config')
      .upsert({
        user_id: user.id,
        visible_columns: columns,
      });
  };

  return (
    <ColumnConfigContext.Provider
      value={{
        visibleColumns,
        setVisibleColumns,
        setColumnOrder: handleSetColumnOrder,
      }}
    >
      {children}
    </ColumnConfigContext.Provider>
  );
};