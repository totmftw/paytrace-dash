import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnSettings } from "./ColumnSettings";
import { Table } from "@tanstack/react-table";

interface InvoiceTableToolbarProps<TData> {
  table: Table<TData>;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onAddInvoice: () => void;
  onSendMessage: () => void;
  selectedCount: number;
}

export function InvoiceTableToolbar<TData>({
  table,
  pageSize,
  onPageSizeChange,
  onAddInvoice,
  onSendMessage,
  selectedCount,
}: InvoiceTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onAddInvoice}>
          Add Invoice
        </Button>
        {selectedCount > 0 && (
          <Button variant="outline" onClick={onSendMessage}>
            Send Message
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Filter invoices..."
          value={(table.getColumn("invNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("invNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <ColumnSettings 
          table={table}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}