// src/components/BatchOperations.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Toast } from '@/components/Toast';

interface BatchOperationsProps {
  selectedIds: number[];
  type: 'invoice' | 'payment';
  onSuccess: () => void;
}

export const BatchOperations = ({ selectedIds, type, onSuccess }: BatchOperationsProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleMarkCleared = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from(type === 'invoice' ? 'invoices' : 'payment_transactions')
        .update({ markCleared: true })
        .in('id', selectedIds);

      if (error) throw error;

      setToast({
        type: 'success',
        message: `Successfully marked ${selectedIds.length} items as cleared`
      });
      onSuccess();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from(type === 'invoice' ? 'invoices' : 'payment_transactions')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setToast({
        type: 'success',
        message: `Successfully deleted ${selectedIds.length} items`
      });
      onSuccess();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleMarkCleared}
        disabled={loading || selectedIds.length === 0}
        className="btn btn-secondary"
      >
        Mark as Cleared
      </button>
      <button
        onClick={handleDelete}
        disabled={loading || selectedIds.length === 0}
        className="btn btn-danger"
      >
        Delete Selected
      </button>
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
