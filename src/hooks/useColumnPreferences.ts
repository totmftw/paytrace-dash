// src/hooks/useColumnPreferences.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from './useUser';

export interface Column {
  key: string;
  header: string;
  visible?: boolean;
  width?: number;
}

export const useColumnPreferences = (tableKey: string) => {
  const { user } = useUser();
  const [columns, setColumns] = useState<Column[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Column[]>([]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('column_preferences')
          .select('*')
          .eq('user_id', user?.id)
          .eq('table_key', tableKey)
          .single();

        if (error && error.code !== 'PGNF') throw error;

        if (data) {
          setColumns(data.columns);
          setVisibleColumns(data.columns.filter(col => col.visible));
        } else {
          // Set default columns if no preferences found
          const defaultColumns = getDefaultColumns(tableKey);
          setColumns(defaultColumns);
          setVisibleColumns(defaultColumns.filter(col => col.visible !== false));
        }
      } catch (error) {
        console.error('Error loading column preferences:', error);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user, tableKey]);

  const savePreferences = async (newColumns: Column[]) => {
    try {
      const { error } = await supabase
        .from('column_preferences')
        .upsert({
          user_id: user?.id,
          table_key: tableKey,
          columns: newColumns
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving column preferences:', error);
    }
  };

  const updateColumnVisibility = async (columnKey: string, visible: boolean) => {
    const newColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible } : col
    );
    setColumns(newColumns);
    setVisibleColumns(newColumns.filter(col => col.visible));
    await savePreferences(newColumns);
  };

  const updateColumnOrder = async (newOrder: Column[]) => {
    setVisibleColumns(newOrder);
    const newColumns = columns.map(col => ({
      ...col,
      visible: newOrder.some(o => o.key === col.key)
    }));
    setColumns(newColumns);
    await savePreferences(newColumns);
  };

  return {
    columns,
    visibleColumns,
    updateColumnVisibility,
    updateColumnOrder
  };
};

const getDefaultColumns = (tableKey: string): Column[] => {
  switch (tableKey) {
    case 'invoices':
      return [
        { key: 'invId', header: 'Invoice ID', visible: true },
        { key: 'customerMaster.custName', header: 'Customer', visible: true },
        { key: 'invDate', header: 'Date', visible: true },
        { key: 'invDuedate', header: 'Due Date', visible: true },
        { key: 'invAmount', header: 'Amount', visible: true },
        { key: 'invGst', header: 'GST', visible: true },
        { key: 'invBalanceAmount', header: 'Balance', visible: true },
        { key: 'invMarkcleared', header: 'Cleared', visible: true }
      ];
    case 'payments':
      return [
        { key: 'paymentId', header: 'Payment ID', visible: true },
        { key: 'invId', header: 'Invoice ID', visible: true },
        { key: 'amount', header: 'Amount', visible: true },
        { key: 'paymentDate', header: 'Date', visible: true },
        { key: 'paymentMode', header: 'Mode', visible: true }
      ];
    default:
      return [];
  }
};
