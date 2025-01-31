// src/components/ExportModal.tsx
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { exportData } from '@/utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  type: 'invoices' | 'payments' | 'ledger';
  availableColumns: { key: string; label: string }[];
}

export const ExportModal = ({
  isOpen,
  onClose,
  data,
  type,
  availableColumns
}: ExportModalProps) => {
  const [format, setFormat] = useState<'xlsx' | 'pdf' | 'csv'>('xlsx');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    availableColumns.map(col => col.key)
  );
  const [fileName, setFileName] = useState(`${type}_${new Date().toISOString().split('T')[0]}`);

  const handleExport = () => {
    exportData(data, {
      fileName,
      format,
      columns: selectedColumns,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <Dialog.Title className="text-xl font-bold mb-4">
            Export Data
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Columns</label>
              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {availableColumns.map(column => (
                  <label key={column.key} className="flex items-center p-1">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, column.key]);
                        } else {
                          setSelectedColumns(
                            selectedColumns.filter(col => col !== column.key)
                          );
                        }
                      }}
                      className="mr-2"
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedColumns.length === 0}
                className="btn btn-primary"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
