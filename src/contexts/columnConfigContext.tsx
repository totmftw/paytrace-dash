import { createContext, useContext, useState } from "react";

interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (columns: string[]) => void;
}

const ColumnConfigContext = createContext<ColumnConfigContextType | undefined>(
  undefined
);

export function ColumnConfigProvider({ children }: { children: React.ReactNode }) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "invNumber",
    "invDate",
    "invDuedate",
    "invTotal",
    "invBalanceAmount",
    "invPaymentStatus"
  ]);

  const setColumnOrder = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  return (
    <ColumnConfigContext.Provider 
      value={{ 
        visibleColumns, 
        setVisibleColumns, 
        setColumnOrder 
      }}
    >
      {children}
    </ColumnConfigContext.Provider>
  );
}

export function useColumnConfig() {
  const context = useContext(ColumnConfigContext);
  if (!context) {
    throw new Error(
      "useColumnConfig must be used within a ColumnConfigProvider"
    );
  }
  return context;
}