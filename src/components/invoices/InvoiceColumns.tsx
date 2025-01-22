import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ReminderMessageForm } from "./ReminderMessageForm";

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
  invBalanceAmount: number | null;
  invReminder1: boolean | null;
  invRemainder2: boolean | null;
  invRemainder3: boolean | null;
  invMarkcleared: boolean | null;
  invAlert: string | null;
  invMessage1: string;
  invMessage2: string | null;
  invMessage3: string | null;
  invPaymentDifference: number;
  invPaymentStatus: string;
  customerMaster: {
    custBusinessname: string;
    custOwnername: string;
    custWhatsapp: number;
  };
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
    cell: ({ row }) => {
      const invNumber = row.getValue("invNumber") as number[];
      return invNumber.join("-");
    },
  },
  {
    accessorKey: "customerMaster.custBusinessname",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Business Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "invDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("invDate");
      return date ? format(new Date(date as string), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "invDuedate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("invDuedate");
      return date ? format(new Date(date as string), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "invValue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Value
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("invValue")),
  },
  {
    accessorKey: "invGst",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        GST
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("invGst")),
  },
  {
    accessorKey: "invAddamount",
    header: "Additional Amount",
    cell: ({ row }) => formatCurrency(row.getValue("invAddamount") || 0),
  },
  {
    accessorKey: "invSubamount",
    header: "Subtracted Amount",
    cell: ({ row }) => formatCurrency(row.getValue("invSubamount") || 0),
  },
  {
    accessorKey: "invTotal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("invTotal")),
  },
  {
    accessorKey: "invBalanceAmount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Balance
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("invBalanceAmount") || 0),
  },
  {
    accessorKey: "reminderStatus",
    header: "Reminder Status",
    cell: ({ row }) => {
      const [showReminderForm, setShowReminderForm] = useState(false);
      const [selectedReminder, setSelectedReminder] = useState<1 | 2 | 3>(1);
      
      const reminder1 = row.original.invReminder1;
      const reminder2 = row.original.invRemainder2;
      const reminder3 = row.original.invRemainder3;
      
      const handleReminderClick = (reminderNumber: 1 | 2 | 3) => {
        setSelectedReminder(reminderNumber);
        setShowReminderForm(true);
      };
      
      return (
        <>
          <div className="space-y-1">
            <button
              onClick={() => handleReminderClick(1)}
              className={`text-xs w-full text-left p-1 rounded ${
                reminder1 ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              Reminder 1: {reminder1 ? 'Sent ✓' : 'Not Sent'}
            </button>
            <button
              onClick={() => handleReminderClick(2)}
              className={`text-xs w-full text-left p-1 rounded ${
                reminder2 ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              Reminder 2: {reminder2 ? 'Sent ✓' : 'Not Sent'}
            </button>
            <button
              onClick={() => handleReminderClick(3)}
              className={`text-xs w-full text-left p-1 rounded ${
                reminder3 ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              Reminder 3: {reminder3 ? 'Sent ✓' : 'Not Sent'}
            </button>
          </div>
          {showReminderForm && (
            <ReminderMessageForm
              invoice={row.original}
              isOpen={showReminderForm}
              onClose={() => setShowReminderForm(false)}
              onSuccess={() => row.table.options.meta?.refetch()}
              reminderNumber={selectedReminder}
            />
          )}
        </>
      );
    }
  },
  {
    accessorKey: "invPaymentDifference",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payment Difference
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const difference = row.getValue("invPaymentDifference") as number;
      return (
        <span className={difference !== 0 ? "text-red-500" : "text-green-500"}>
          {formatCurrency(difference)}
        </span>
      );
    },
  },
  {
    accessorKey: "invPaymentStatus",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.getValue("invMarkcleared")
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.getValue("invPaymentStatus")}
      </span>
    ),
  },
];