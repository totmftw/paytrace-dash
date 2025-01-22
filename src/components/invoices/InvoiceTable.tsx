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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentForm } from "./PaymentForm";
import { InvoiceForm } from "./InvoiceForm";
import { WhatsAppReminder } from "./WhatsAppReminder";
import { InvoiceTableToolbar } from "./InvoiceTableToolbar";
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
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [pageSize, setPageSize] = useState(10);

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
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

  const getSelectedInvoices = useCallback(() => {
    return table.getSelectedRowModel().rows.map(row => row.original);
  }, [table]);

  return (
    <div className="space-y-4">
      <InvoiceTableToolbar
        table={table}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onAddInvoice={() => setShowInvoiceForm(true)}
        onSendMessage={() => setShowReminderForm(true)}
        selectedCount={table.getSelectedRowModel().rows.length}
      />

      <div className="rounded-md border">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    ))}
                    {canManagePayments && <TableHead>Actions</TableHead>}
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(row.original)}
                            >
                              Update Payment
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditInvoice(row.original)}
                            >
                              Edit Invoice
                            </Button>
                          </div>
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

      {editInvoice && (
        <InvoiceForm
          isOpen={true}
          invoice={editInvoice}
          onClose={() => setEditInvoice(null)}
          onSuccess={onRefresh}
        />
      )}

      {showReminderForm && (
        <WhatsAppReminder
          selectedInvoices={getSelectedInvoices()}
          isOpen={true}
          onClose={() => setShowReminderForm(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}