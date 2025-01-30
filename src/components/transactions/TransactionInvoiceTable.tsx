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
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PDFExport } from "../buttons/PDFExport";
import { useColumnConfig } from "@/contexts/columnConfigContext";
import { Invoice } from "@/types/types";
import { formatCurrency } from "@/lib/utils";

interface TransactionInvoiceTableProps {
  data: Invoice[];
  onCustomerClick: (customer: any) => void;
  onInvoiceClick: (invoice: Invoice) => void;
}

export function TransactionInvoiceTable({
  data,
  onCustomerClick,
  onInvoiceClick,
}: TransactionInvoiceTableProps) {
  const { visibleColumns, setVisibleColumns } = useColumnConfig();
  
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invNumber",
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
    data: data || [],
    columns: columns.filter(col => visibleColumns.includes(col.accessorKey)),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <PDFExport data={data} />
        <Button 
          variant="ghost"
          onClick={() => {/* open column config modal */}}
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
