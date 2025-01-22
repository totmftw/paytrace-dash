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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentForm } from "./PaymentForm";
import { InvoiceForm } from "./InvoiceForm";
import { WhatsAppReminder } from "./WhatsAppReminder";
import { ColumnSettings } from "./ColumnSettings";
import { ReminderMessageForm } from "./ReminderMessageForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch user role to check permissions
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      return data;
    }
  });

  const canManagePayments = userProfile?.role && ['it_admin', 'business_owner', 'business_manager'].includes(userProfile.role);

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
    onColumnOrderChange: setColumnOrder,
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
    meta: {
      refetch: onRefresh,
    },
  });

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
          <ColumnSettings 
            table={table}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="sticky top-0 bg-white">
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                    {canManagePayments && <TableHead className="sticky top-0 bg-white">Actions</TableHead>}
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
                      {canManagePayments && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoice(row.original)}
                          >
                            Update Payment
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (canManagePayments ? 1 : 0)}
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