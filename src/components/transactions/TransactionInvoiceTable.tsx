import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
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
import { PDFExport } from "@/components/buttons/PDFExport";
import { useColumnConfig } from "@/contexts/columnConfigContext";
import { Invoice } from "@/types/types";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionInvoiceTableProps {
  data: Invoice[];
  onCustomerClick: (customer: any) => void;
  onInvoiceClick: (invoice: Invoice) => void;
  isLoading?: boolean;
}

export function TransactionInvoiceTable({
  data,
  onCustomerClick,
  onInvoiceClick,
  isLoading = false,
}: TransactionInvoiceTableProps) {
  const { visibleColumns } = useColumnConfig();

  const pdfData = data.map(invoice => ({
    date: invoice.invDate || '',
    description: `Invoice #${invoice.invNumber}`,
    amount: invoice.invTotal,
    balance: invoice.invBalanceAmount || 0
  }));

  const columns = [
    {
      id: "invNumber",
      header: "Invoice Number",
      cell: ({ row }) => {
        return (
          <Button
            variant="link"
            onClick={() => onInvoiceClick(row.original)}
          >
            {row.getValue("invNumber")}
          </Button>
        );
      },
    },
    {
      id: "invDate",
      header: "Invoice Date",
      cell: ({ row }) => {
        const date = row.getValue("invDate");
        return date ? new Date(date as string).toLocaleDateString() : "-";
      },
    },
    {
      id: "invDuedate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue("invDuedate");
        return date ? new Date(date as string).toLocaleDateString() : "-";
      },
    },
    {
      id: "invTotal",
      header: "Total Amount",
      cell: ({ row }) => formatCurrency(row.getValue("invTotal") as number),
    },
    {
      id: "invBalanceAmount",
      header: "Balance Amount",
      cell: ({ row }) => formatCurrency(row.getValue("invBalanceAmount") as number),
    },
    {
      id: "invPaymentStatus",
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
    data,
    columns: columns.filter((col) => visibleColumns.includes(col.id)),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border rounded-md">
          <div className="h-[400px] flex items-center justify-center">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <PDFExport data={pdfData} />
        <Button
          variant="ghost"
          onClick={() => {
            // Configure columns logic
          }}
        >
          Configure Columns
        </Button>
      </div>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
