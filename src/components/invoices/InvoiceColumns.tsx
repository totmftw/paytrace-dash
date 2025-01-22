import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

export type Invoice = {
  invId: number;
  invNumber: number[];
  invDate: string | null;
  invDuedate: string | null;
  invValue: number;
  invGst: number;
  invAddamount: number | null;
  invSubamount: number | null;
  invTotal: number;
  invReminder1: boolean | null;
  invRemainder2: boolean | null;
  invRemainder3: boolean | null;
  invMarkcleared: boolean | null;
  invAlert: string | null;
  invMessage1: string;
  invMessage2: string | null;
  invMessage3: string | null;
  customerMaster: {
    custBusinessname: string;
    custOwnername: string;
  } | null;
};

export const columns: ColumnDef<Invoice>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "invNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Invoice Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("invNumber").join("-"),
  },
  {
    accessorKey: "customerMaster.custBusinessname",
    header: "Business Name",
  },
  {
    accessorKey: "invDate",
    header: "Date",
  },
  {
    accessorKey: "invDuedate",
    header: "Due Date",
  },
  {
    accessorKey: "invValue",
    header: "Value",
    cell: ({ row }) => formatCurrency(row.getValue("invValue")),
  },
  {
    accessorKey: "invGst",
    header: "GST",
    cell: ({ row }) => formatCurrency(row.getValue("invGst")),
  },
  {
    accessorKey: "invTotal",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.getValue("invTotal")),
  },
  {
    accessorKey: "invMarkcleared",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.getValue("invMarkcleared")
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.getValue("invMarkcleared") ? "Paid" : "Pending"}
      </span>
    ),
  },
];