// src/components/AddInvoiceModal/index.tsx
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { supabase } from '@/lib/supabaseClient';
import { Invoice } from '@/types';
import CustomerSelect from './CustomerSelect';
import DatePicker from './DatePicker';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  year: string;
}

const AddInvoiceModal = ({ isOpen, onClose, onSuccess, year }: AddInvoiceModalProps) => {
  const [formData, setFormData] = useState({
    invCustid: '',
    invDate: '',
    invDuedate: '',
    invAmount: '',
    invGst: '',
    invAddamount: '0',
    invMessage1: '',
    invMessage2: '',
    invAlert: '',
    invMarkcleared: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase
        .from('invoices')
        .insert([
          {
            ...formData,
            fy: year,
            invAmount: Number(formData.invAmount),
            invGst: Number(formData.invGst),
            invAddamount: Number(formData.invAddamount)
          }
        ]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <Dialog.Title className="text-xl font-bold mb-4">
            Add New Invoice
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CustomerSelect
              value={formData.invCustid}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                invCustid: value
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Invoice Date"
                value={formData.invDate}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  invDate: value
                }))}
              />

              <DatePicker
                label="Due Date"
                value={formData.invDuedate}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  invDuedate: value
                }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Amount"
                value={formData.invAmount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invAmount: e.target.value
                }))}
                className="input"
              />

              <input
                type="number"
                placeholder="GST"
                value={formData.invGst}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invGst: e.target.value
                }))}
                className="input"
              />

              <input
                type="number"
                placeholder="Additional Amount"
                value={formData.invAddamount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invAddamount: e.target.value
                }))}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Message 1"
                value={formData.invMessage1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invMessage1: e.target.value
                }))}
                className="input"
              />

              <input
                type="text"
                placeholder="Message 2"
                value={formData.invMessage2}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invMessage2: e.target.value
                }))}
                className="input"
              />
            </div>

            <input
              type="text"
              placeholder="Alert"
              value={formData.invAlert}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                invAlert: e.target.value
              }))}
              className="input"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.invMarkcleared}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invMarkcleared: e.target.checked
                }))}
                className="mr-2"
              />
              <label>Mark as Cleared</label>
            </div>

            {error && (
              <div className="text-red-500">{error}</div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Invoice
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default AddInvoiceModal;
