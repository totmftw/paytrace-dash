import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { TableFilters } from "./table/TableFilters";
import { TableContent } from "./table/TableContent";
import { TablePagination } from "./table/TablePagination";

export interface Payment {
  invNumber: number[];
  customerMaster: {
    custBusinessname: string;
  };
  invDate: string;
  invDuedate: string;
  invTotal: number;
}

interface PaymentDetailsTableProps {
  data: Payment[];
}

export function PaymentDetailsTable({ data }: PaymentDetailsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "invNumber",
      header: "Invoice Number",
      cell: ({ row }) => {
        const invNumber = row.getValue("invNumber") as number[];
        return invNumber.join("-");
      },
    },
    {
      accessorKey: "customerMaster.custBusinessname",
      header: "Business Name",
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
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("invTotal")),
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
      <TableFilters table={table} />
      <TableContent table={table} columns={columns} />
      <TablePagination table={table} />
    </div>
  );
}