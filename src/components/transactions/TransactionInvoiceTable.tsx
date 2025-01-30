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
import { formatCurrency } from "@/lib/utils";

interface TransactionInvoiceTableProps {
  data: any[];
  onCustomerClick: (customer: any) => void;
  onInvoiceClick: (invoice: any) => void;
}

export function TransactionInvoiceTable({
  data,
  onCustomerClick,
  onInvoiceClick,
}: TransactionInvoiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "customerMaster.custBusinessname",
      header: "Customer Name",
      cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => onCustomerClick(row.original.customerMaster)}
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
      accessorKey: "invDate",
      header: "Invoice Date",
      cell: ({ row }) => new Date(row.getValue("invDate")).toLocaleDateString(),
    },
    {
      accessorKey: "invDuedate",
      header: "Due Date",
      cell: ({ row }) => new Date(row.getValue("invDuedate")).toLocaleDateString(),
    },
    {
      accessorKey: "invTotal",
      header: "Total Amount",
      cell: ({ row }) => formatCurrency(row.getValue("invTotal")),
    },
    {
      accessorKey: "invBalanceAmount",
      header: "Balance Amount",
      cell: ({ row }) => formatCurrency(row.getValue("invBalanceAmount")),
    },
    {
      accessorKey: "invPaymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.getValue("invPaymentStatus");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "paid"
                ? "bg-green-100 text-green-800"
                : status === "partial"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
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

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="rounded-md border">
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
        </div>
      </ScrollArea>

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
    </div>
  );
}