// src/pages/Transactions/PaymentsTab.tsx
import { useState } from 'react';
import { usePayments } from '@/hooks/usePayments';
import PaymentTable from './components/PaymentTable';
import AddPaymentModal from './components/AddPaymentModal';
import { Toast } from '@/components/Toast';

interface PaymentsTabProps {
  year: string;
}

// src/pages/Transactions/PaymentsTab.tsx
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { usePayments } from '@/hooks/usePayments';
import PaymentTable from './components/PaymentTable';
import AddPaymentModal from './components/AddPaymentModal';
import ColumnManagerModal from './components/ColumnManagerModal';
import { handleExcelUpload, downloadTemplate } from '@/utils/paymentExcel';
import Toast from '@/components/Toast';

interface PaymentsTabProps {
  year: string;
}

const PaymentsTab = ({ year }: PaymentsTabProps) => {
  const { user } = useUser();
  const { payments, loading, error, refreshPayments } = usePayments(year);
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
          message: `Found ${result.duplicates.length} duplicate payments. Please check the data.`
        });
        return;
      }

      await refreshPayments();
      setToast({
        type: 'success',
        message: 'Payments uploaded successfully!'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            Add Payment
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
            id="payment-upload"
          />
          <label htmlFor="payment-upload" className="btn btn-secondary">
            Upload Payments
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
        <PaymentTable
          payments={payments}
          loading={loading}
        />
      </div>

      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshPayments();
          setToast({
            type: 'success',
            message: 'Payment added successfully!'
          });
        }}
        year={year}
      />

      {user?.role === 'IT_ADMIN' && (
        <ColumnManagerModal
          isOpen={isColumnManagerOpen}
          onClose={() => setIsColumnManagerOpen(false)}
          tableKey="payments"
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

export default PaymentsTab;

const PaymentsTab = ({ year }: PaymentsTabProps) => {
  const { payments, loading, error, refreshPayments } = usePayments(year);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
        >
          Add Payment
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <PaymentTable
          payments={payments}
          loading={loading}
        />
      </div>

      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshPayments();
          setToast({
            type: 'success',
            message: 'Payment added successfully!'
          });
        }}
        year={year}
      />

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

export default PaymentsTab;
