import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ReminderMessageForm } from "../invoices/ReminderMessageForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  id: number;
  name: string;
  whatsappNumber: number;
}

interface InvoicePaymentTableProps {
  data: any[];
  onCustomerClick: (customer: CustomerData) => void;
  onInvoiceClick: (invoice: any) => void;
}

export function InvoicePaymentTable({
  data,
  onCustomerClick,
  onInvoiceClick,
}: InvoicePaymentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

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

  const canEdit = userProfile?.role && ['it_admin', 'business_owner'].includes(userProfile.role);

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "customerMaster.custBusinessname",
      header: "Customer Name",
      cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => onCustomerClick({
            id: row.original.customerMaster.id,
            name: row.original.customerMaster.custBusinessname,
            whatsappNumber: row.original.customerMaster.custWhatsapp
          })}
        >
          {row.getValue("customerMaster.custBusinessname")}
        </Button>
      ),
    },
    {
      accessorKey: "invNumber",
      header: "Invoice Number",
      cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => onInvoiceClick(row.original)}
        >
          {(row.getValue("invNumber") as number[]).join("-")}
        </Button>
      ),
    },
    {
      accessorKey: "invTotal",
      header: "Total Value",
      cell: ({ row }) => formatCurrency(row.getValue("invTotal")),
    },
    {
      accessorKey: "invBalanceAmount",
      header: "Outstanding Amount",
      cell: ({ row }) => formatCurrency(row.getValue("invBalanceAmount")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Handle edit */}}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedInvoice(row.original);
              setShowReminderForm(true);
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter customer names..."
          value={(table.getColumn("customerMaster.custBusinessname")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customerMaster.custBusinessname")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[calc(100vh-300px)]">
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

      {showReminderForm && selectedInvoice && (
        <ReminderMessageForm
          invoice={selectedInvoice}
          isOpen={showReminderForm}
          onClose={() => {
            setShowReminderForm(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowReminderForm(false);
            setSelectedInvoice(null);
          }}
          reminderNumber={1}
        />
      )}
    </div>
  );
}