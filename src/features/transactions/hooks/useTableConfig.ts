import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTableConfig(tableName: string) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', session.user.id)
        .single();
      
      return data;
    }
  });

  useEffect(() => {
    if (userProfile?.preferences?.[tableName]) {
      const config = userProfile.preferences[tableName];
      if (config.visibleColumns) setVisibleColumns(config.visibleColumns);
      if (config.columnOrder) setColumnOrder(config.columnOrder);
    }
  }, [userProfile, tableName]);

  const updateConfig = async (
    newVisibleColumns: string[],
    newColumnOrder: string[]
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', session.user.id)
      .single();

    const preferences = profile?.preferences || {};
    preferences[tableName] = {
      ...preferences[tableName],
      visibleColumns: newVisibleColumns,
      columnOrder: newColumnOrder,
    };

    await supabase
      .from('user_profiles')
      .update({ preferences })
      .eq('id', session.user.id);

    setVisibleColumns(newVisibleColumns);
    setColumnOrder(newColumnOrder);
  };

  return {
    visibleColumns,
    columnOrder,
    updateConfig,
  };
}