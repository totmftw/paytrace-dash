// src/contexts/DashboardContext.tsx
import { createContext, useContext, useState } from 'react';
import { Invoice } from '@/types';

interface DashboardContextType {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: React.Dispatch<React.SetStateAction<Invoice | null>>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <DashboardContext.Provider
      value={{
        invoices,
        selectedInvoice,
        setSelectedInvoice,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};