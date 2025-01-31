// src/pages/Transactions/InvoicesTab.tsx
import { useState } from 'react';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useUser } from '@/hooks/useUser';
import InvoiceTable from './components/InvoiceTable';
import AddInvoiceModal from './components/AddInvoiceModal';
import ColumnManagerModal from './components/ColumnManagerModal';
import { handleExcelUpload, downloadTemplate } from '@/utils/excel';
import Toast from '@/components/Toast';

interface InvoicesTabProps {
  year: string;
}

const InvoicesTab = ({ year }: InvoicesTabProps) => {
  const { user } = useUser();
  const { invoices, loading, error, refreshData } = useInvoiceData(year);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await handleExcelUpload(file, year);
      
      if (result.duplicates.length > 0) {
        setToast({
          type: 'error',
          message: `Found ${result.duplicates.length} duplicate entries`
        });
        return;
      }

      await refreshData();
      setToast({
        type: 'success',
        message: 'Invoices uploaded successfully!'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            Add Invoice
          </button>
          <button
            onClick={downloadTemplate}
            className="btn btn-secondary"
          >
            Download Template
          </button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="invoice-upload"
          />
          <label htmlFor="invoice-upload" className="btn btn-secondary">
            Upload Invoices
          </label>
        </div>
        {user?.role === 'IT_ADMIN' && (
          <button
            onClick={() => setIsColumnManagerOpen(true)}
            className="btn btn-outline"
          >
            Manage Columns
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <InvoiceTable
          invoices={invoices}
          loading={loading}
        />
      </div>

      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshData();
          setToast({
            type: 'success',
            message: 'Invoice added successfully!'
          });
        }}
        year={year}
      />

      {user?.role === 'IT_ADMIN' && (
        <ColumnManagerModal
          isOpen={isColumnManagerOpen}
          onClose={() => setIsColumnManagerOpen(false)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default InvoicesTab;
