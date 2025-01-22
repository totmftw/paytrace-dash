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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PaymentForm } from "./PaymentForm";
import { InvoiceForm } from "./InvoiceForm";
import { WhatsAppReminder } from "./WhatsAppReminder";

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
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
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
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;
    
    const newColumnOrder = Array.from(columnOrder);
    const [removed] = newColumnOrder.splice(result.source.index, 1);
    newColumnOrder.splice(result.destination.index, 0, removed);
    
    setColumnOrder(newColumnOrder);
  }, [columnOrder]);

  const selectedInvoices = table.getSelectedRowModel().rows.map(row => row.original);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInvoiceForm(true)}
          >
            Add Invoice
          </Button>
          {selectedInvoices.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowReminderForm(true)}
            >
              Send Reminders
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
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      <div className="rounded-md border overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns" direction="horizontal">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-full"
                  >
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header, index) => (
                              <Draggable
                                key={header.id}
                                draggableId={header.id}
                                index={index}
                                isDragDisabled={!header.column.getCanSort()}
                              >
                                {(provided) => (
                                  <TableHead
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {header.isPlaceholder ? null : (
                                      <div>
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                        {header.column.getCanFilter() && (
                                          <div className="mt-2">
                                            <Input
                                              placeholder={`Filter ${header.column.id}...`}
                                              value={(header.column.getFilterValue() as string) ?? ""}
                                              onChange={(event) =>
                                                header.column.setFilterValue(event.target.value)
                                              }
                                              className="max-w-sm"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </TableHead>
                                )}
                              </Draggable>
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
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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

      {showInvoiceForm && (
        <InvoiceForm
          isOpen={true}
          onClose={() => setShowInvoiceForm(false)}
          onSuccess={onRefresh}
        />
      )}

      {showReminderForm && (
        <WhatsAppReminder
          selectedInvoices={selectedInvoices}
          isOpen={true}
          onClose={() => setShowReminderForm(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}