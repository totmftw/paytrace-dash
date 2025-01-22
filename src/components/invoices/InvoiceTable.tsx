import { useState, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentForm } from "./PaymentForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRefresh: () => void;
}

export function InvoiceTable<TData, TValue>({
  columns,
  data,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => (column.id as string))
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
  });

  const reorderColumn = useCallback(
    (draggedColumnId: string, targetColumnId: string) => {
      const newColumnOrder = [...columnOrder];
      const currentPosition = newColumnOrder.indexOf(draggedColumnId);
      const newPosition = newColumnOrder.indexOf(targetColumnId);
      
      newColumnOrder.splice(currentPosition, 1);
      newColumnOrder.splice(newPosition, 0, draggedColumnId);
      
      setColumnOrder(newColumnOrder);
    },
    [columnOrder]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Input
          placeholder="Filter invoices..."
          value={(table.getColumn("invNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("invNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Column Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visible Columns</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {column.id}
                      </label>
                    </div>
                  );
                })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="w-full">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedInvoice(row.original)}
                          disabled={(row.original as any).invMarkcleared}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {selectedInvoice && (
        <PaymentForm
          invoice={selectedInvoice}
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}