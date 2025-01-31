// src/components/InvoiceTable/index.tsx
import { useState, useMemo } from 'react';
import { Table } from '@tanstack/react-table';
import { useUser } from '@/hooks/useUser';
import { Invoice } from '@/types';
import { ExportModal } from '../ExportModal';
import { DetailedInvoiceView } from '../DetailedInvoiceView';
import { BatchOperations } from '../BatchOperations';
import { Toast } from '../Toast';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';

interface InvoiceTableProps {
  invoices: Invoice[];
  loading: boolean;
  year: string;
}

const InvoiceTable = ({ invoices, loading, year }: InvoiceTableProps) => {
  const { user } = useUser();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [detailedViewInvoice, setDetailedViewInvoice] = useState<Invoice | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { columns, visibleColumns, updateColumnOrder } = useColumnPreferences('invoices');

  const availableColumns = [
    { key: 'invId', label: 'Invoice ID' },
    { key: 'invDate', label: 'Date' },
    { key: 'invDuedate', label: 'Due Date' },
    { key: 'invAmount', label: 'Amount' },
    { key: 'invGst', label: 'GST' },
    { key: 'invAddamount', label: 'Additional Amount' },
    { key: 'invBalanceAmount', label: 'Balance' },
    { key: 'customerMaster.custName', label: 'Customer Name' },
    { key: 'customerMaster.custGst', label: 'Customer GST' },
    { key: 'invMarkcleared', label: 'Cleared' }
  ];

  const filteredAndSortedInvoices = useMemo(() => {
    let processed = [...invoices];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        processed = processed.filter(invoice => {
          const field = key.includes('.')
            ? key.split('.').reduce((obj, key) => obj?.[key], invoice)
            : invoice[key as keyof Invoice];
          return String(field).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      processed.sort((a, b) => {
        const aVal = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a)
          : a[sortConfig.key];
        const bVal = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b)
          : b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [invoices, filters, sortConfig]);

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);

  const handleSort = (key: keyof Invoice) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleRowSelect = (invId: number) => {
    setSelectedRows(prev => 
      prev.includes(invId)
        ? prev.filter(id => id !== invId)
        : [...prev, invId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? paginatedInvoices.map(inv => inv.invId) : []);
  };

  const handleBatchOperationSuccess = () => {
    setSelectedRows([]);
    setToast({
      type: 'success',
      message: 'Batch operation completed successfully'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn btn-secondary"
          >
            Export Data
          </button>
          {selectedRows.length > 0 && (
            <BatchOperations
              selectedIds={selectedRows}
              type="invoice"
              onSuccess={handleBatchOperationSuccess}
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginatedInvoices.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof Invoice)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig?.key === column.key && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={filters[column.key] || ''}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-full text-sm border rounded"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedInvoices.map(invoice => (
              <tr
                key={invoice.invId}
                onClick={() => setDetailedViewInvoice(invoice)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="w-8 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(invoice.invId)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRowSelect(invoice.invId);
                    }}
                  />
                </td>
                {visibleColumns.map(column => (
                  <td key={column.key} className="px-4 py-2">
                    {formatCellValue(invoice, column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)} of {filteredAndSortedInvoices.length}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={filteredAndSortedInvoices}
        type="invoices"
        availableColumns={availableColumns}
      />

      {detailedViewInvoice && (
        <DetailedInvoiceView
          invoice={detailedViewInvoice}
          isOpen={!!detailedViewInvoice}
          onClose={() => setDetailedViewInvoice(null)}
        />
      )}

      {/* Toast */}
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

// Helper function to format cell values
const formatCellValue = (invoice: Invoice, key: string) => {
  const value = key.includes('.')
    ? key.split('.').reduce((obj, key) => obj?.[key], invoice)
    : invoice[key as keyof Invoice];

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('en-IN');
  }
  return value;
};

export default InvoiceTable;
