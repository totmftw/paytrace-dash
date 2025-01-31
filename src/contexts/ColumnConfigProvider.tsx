// src/contexts/ColumnConfigProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ColumnConfigContextType {
  visibleColumns: string[];
  setColumnOrder: (order: string[]) => void;
}

const ColumnConfigContext = createContext<ColumnConfigContextType>({
  visibleColumns: [],
  setColumnOrder: () => {},
});

export const ColumnConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserColumns = async () => {
      if (!user) return;
      const { data } = await supabase.from("user_preferences").select("columns").eq("user_id", user.id);
      if (data?.[0]?.columns) {
        setVisibleColumns(data[0].columns);
      }
    };

    fetchUserColumns();
  }, []);

  const handleColumnOrder = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    supabase.from("user_preferences").upsert({
      user_id: user?.id,
      columns: newOrder,
    });
  };

  return (
    <ColumnConfigContext.Provider value={{ visibleColumns, setColumnOrder: handleColumnOrder }}>
      {children}
    </ColumnConfigContext.Provider>
  );
};