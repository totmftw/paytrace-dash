import React, { useState } from "react";
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
import PDFExport from "./PDFExport";

interface TransactionInvoiceTableProps {
  data: any[];
  onCustomerClick: (customer: any) => void;
  onInvoiceClick: (invoice: any) => void;
}

interface InvoiceData {
  invDate: string | null;
  invDuedate: string | null;
  invNumber: string | number | (string | number)[];
  invTotal: number;
  invBalanceAmount: number;
  invPaymentStatus: string;
  customerMaster?: {
    custBusinessname: string;
  };
}

export function TransactionInvoiceTable({
  data = [],
  onCustomerClick,
  onInvoiceClick,
}: TransactionInvoiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

  const formatInvoiceNumber = (invNumber: InvoiceData['invNumber']): string => {
    if (Array.isArray(invNumber)) {
      return invNumber.join("-");
    }
    return String(invNumber || '');
  };

  const columns: ColumnDef<InvoiceData>[] = [
    {
      accessorKey: "customerMaster.custBusinessname",
      header: "Business Name",
      cell: ({ row }) => {
        const businessName = row.original.customerMaster?.custBusinessname;
        return businessName ? (
          <Button
            variant="link"
            className="text-table-link hover:text-table-link/80"
            onClick={() => onCustomerClick(row.original.customerMaster)}
          >
            {businessName}
          </Button>
        ) : (
          "N/A"
        );
      },
    },
    {
      accessorKey: "invNumber",
      header: "Invoice Number",
      cell: ({ row }) => {
        const invNumber = formatInvoiceNumber(row.getValue("invNumber"));
        return (
          <Button
            variant="link"
            onClick={() => onInvoiceClick(row.original)}
          >
            {invNumber}
          </Button>
        );
      },
    },
    {
      accessorKey: "invDate",
      header: "Invoice Date",
      cell: ({ row }) => {
        const date = row.getValue("invDate") as string | null;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "invDuedate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue("invDuedate") as string | null;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
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
        const status = row.getValue("invPaymentStatus") as string;
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
    data: data || [], // Ensure data is never undefined
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Show loading state if data is undefined
  if (!data) {
    return (
      <div className="flex items-center justify-center h-48">
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter business names..."
          value={(table.getColumn("customerMaster.custBusinessname")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customerMaster.custBusinessname")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <PDFExport data={data} />
        <Button 
          variant="ghost"
          onClick={() => setIsColumnConfigOpen(true)}
        >
          Configure Columns
        </Button>
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
