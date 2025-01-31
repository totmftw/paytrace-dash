import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ColumnConfigContextType, UserPreferences } from '@/types/types';

const ColumnConfigContext = createContext<ColumnConfigContextType>({
  visibleColumns: [],
  setVisibleColumns: () => {},
  setColumnOrder: async () => {},
});

export const useColumnConfig = () => useContext(ColumnConfigContext);

export const ColumnConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchColumns = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const preferences = data?.preferences as UserPreferences;
      if (preferences?.columns) {
        setVisibleColumns(preferences.columns);
      }
    };
    fetchColumns();
  }, [user]);

  const setColumnOrder = async (order: string[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferences: {
          columns: order,
        },
      })
      .eq('id', user.id);

    if (!error) {
      setVisibleColumns(order);
    }
  };

  return (
    <ColumnConfigContext.Provider value={{ visibleColumns, setVisibleColumns, setColumnOrder }}>
      {children}
    </ColumnConfigContext.Provider>
  );
};