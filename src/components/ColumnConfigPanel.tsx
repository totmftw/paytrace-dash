import { useAuth } from "@/contexts/AuthContext";
import { useColumnConfig } from "@/contexts/ColumnConfigContext";

export function ColumnConfigPanel() {
  const { user } = useAuth();
  const { visibleColumns, setColumnOrder } = useColumnConfig();

  if (user?.role !== "it_admin") return null;

  return (
    <details open className="space-y-4">
      <summary className="font-medium">Column Configuration</summary>
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={visibleColumns.includes("invDate")}
          onCheckedChange={(checked) => {
            if (checked) setColumnOrder([...visibleColumns, "invDate"]);
            else setColumnOrder(visibleColumns.filter(col => col !== "invDate"));
          }}
        />
        Show Invoice Date
      </div>
      {/* Add more column toggles */}
    </details>
  );
}