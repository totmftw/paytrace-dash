// src/components/modals/ColumnConfigPanel.tsx
import { useColumnConfig } from '@/contexts/ColumnConfigContext';
import { useAuth } from '@/contexts/AuthContext';

const defaultColumns = [
  { key: 'invNumber', label: 'Invoice Number' },
  { key: 'invDate', label: 'Invoice Date' },
  { key: 'invDuedate', label: 'Due Date' },
  // ... other columns
];

export function ColumnConfigPanel() {
  const { visibleColumns, setColumnOrder } = useColumnConfig();
  const { user } = useAuth();

  if (user?.role !== 'it_admin') return null;

  const toggleColumn = (columnKey: string, checked: boolean) => {
    if (checked) {
      setColumnOrder([...visibleColumns, columnKey]);
    } else {
      setColumnOrder(visibleColumns.filter((col) => col !== columnKey));
    }
  };

  return (
    <details className="space-y-4">
      <summary className="font-medium">Column Configuration</summary>
      <div className="space-y-2">
        {defaultColumns.map((column) => (
          <div key={column.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={visibleColumns.includes(column.key)}
              onChange={(e) => toggleColumn(column.key, e.target.checked)}
            />
            <label className="text-sm">{column.label}</label>
          </div>
        ))}
      </div>
    </details>
  );
}