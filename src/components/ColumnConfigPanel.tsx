import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useColumnConfig } from "@/contexts/ColumnConfigContext";

const defaultColumns = {
  invDate: "Invoice Date",
  invNumber: "Invoice Number",
  invTotal: "Total Amount",
  invPaymentStatus: "Payment Status",
  // Add more columns as needed
};

export function ColumnConfigPanel() {
  const { user } = useAuth();
  const { visibleColumns, setColumnOrder } = useColumnConfig();

  if (user?.role !== "it_admin") return null;

  const toggleColumn = (columnId: string, checked: boolean) => {
    if (checked) {
      setColumnOrder([...visibleColumns, columnId]);
    } else {
      setColumnOrder(visibleColumns.filter(col => col !== columnId));
    }
  };

  return (
    <details className="space-y-4">
      <summary className="font-medium">Column Configuration</summary>
      <div className="space-y-2">
        {Object.entries(defaultColumns).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox 
              id={key}
              checked={visibleColumns.includes(key)}
              onCheckedChange={(checked) => toggleColumn(key, checked as boolean)}
            />
            <label htmlFor={key} className="text-sm">
              {label}
            </label>
          </div>
        ))}
      </div>
    </details>
  );
}
