// src/contexts/columnOrderContext.tsx
import { createContext, useContext, useState } from 'react';

interface ColumnOrderContextType {
  order: string[];
  setOrder: (columns: string[]) => void;
}

export const ColumnOrderContext = createContext<ColumnOrderContextType>({
  order: [],
  setOrder: () => {}
});

export const ColumnOrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [order, setOrder] = useState<string[]>([]);

  return (
    <ColumnOrderContext.Provider value={{ order, setOrder }}>
      {children}
    </ColumnOrderContext.Provider>
  );
};

export const useColumnOrder = () => useContext(ColumnOrderContext);