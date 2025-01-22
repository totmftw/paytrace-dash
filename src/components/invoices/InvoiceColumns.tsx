import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpDown, Edit } from "lucide-react";
import { format } from "date-fns";
import { ReminderMessageForm } from "./ReminderMessageForm";
import { useToast } from "@/hooks/use-toast";

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
    custOwnerwhatsapp: number;
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const invNumber = row.getValue("invNumber") as number[];
      return invNumber.join("-");
    },
  },
  {
    accessorKey: "customerMaster.custBusinessname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "invDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("invDate");
      return date ? format(new Date(date as string), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "invDuedate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("invDuedate");
      return date ? format(new Date(date as string), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "invValue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatCurrency(row.getValue("invValue")),
  },
  {
    accessorKey: "invGst",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GST
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatCurrency(row.getValue("invTotal")),
  },
  {
    accessorKey: "invBalanceAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatCurrency(row.getValue("invBalanceAmount") || 0),
  },
  {
    accessorKey: "invPaymentStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "reminderStatus",
    header: "Reminder Status",
    cell: ({ row, table }) => {
      const [showReminderForm, setShowReminderForm] = useState(false);
      const [selectedReminder, setSelectedReminder] = useState<1 | 2 | 3>(1);
      const { toast } = useToast();
      
      const reminder1 = row.original.invReminder1;
      const reminder2 = row.original.invRemainder2;
      const reminder3 = row.original.invRemainder3;
      
      const handleReminderClick = (reminderNumber: 1 | 2 | 3) => {
        if (reminderNumber === 2 && !reminder1) {
          toast({
            variant: "destructive",
            title: "Cannot send Reminder 2",
            description: "Please send Reminder 1 first.",
          });
          return;
        }
        if (reminderNumber === 3 && !reminder2) {
          toast({
            variant: "destructive",
            title: "Cannot send Reminder 3",
            description: "Please send Reminder 2 first.",
          });
          return;
        }
        
        setSelectedReminder(reminderNumber);
        setShowReminderForm(true);
      };
      
      return (
        <>
          <div className="space-y-1">
            <button
              onClick={() => handleReminderClick(1)}
              disabled={reminder1}
              className={`text-xs w-full text-left p-1 rounded ${
                reminder1 
                  ? 'text-green-600 bg-green-50 cursor-default' 
                  : 'text-red-500 hover:bg-gray-50'
              }`}
            >
              Reminder 1
            </button>
            <button
              onClick={() => handleReminderClick(2)}
              disabled={reminder2 || !reminder1}
              className={`text-xs w-full text-left p-1 rounded ${
                reminder2 
                  ? 'text-green-600 bg-green-50 cursor-default' 
                  : 'text-red-500 hover:bg-gray-50'
              }`}
            >
              Reminder 2
            </button>
            <button
              onClick={() => handleReminderClick(3)}
              disabled={reminder3 || !reminder2}
              className={`text-xs w-full text-left p-1 rounded ${
                reminder3 
                  ? 'text-green-600 bg-green-50 cursor-default' 
                  : 'text-red-500 hover:bg-gray-50'
              }`}
            >
              Reminder 3
            </button>
          </div>
          {showReminderForm && (
            <ReminderMessageForm
              invoice={row.original}
              isOpen={showReminderForm}
              onClose={() => setShowReminderForm(false)}
              onSuccess={() => {
                const meta = table.options.meta as { refetch?: () => void };
                if (meta?.refetch) {
                  meta.refetch();
                }
              }}
              reminderNumber={selectedReminder}
            />
          )}
        </>
    );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Handle edit action
            console.log("Edit row:", row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      );
    },
  },
];
