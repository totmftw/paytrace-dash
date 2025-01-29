import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const balanceColumns = (
  setSelectedCustomer: (customer: { id: number; name: string; whatsapp: number; } | null) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "custBusinessname",
    header: "Business Name",
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => formatCurrency(row.getValue("balance")),
  },
  {
    accessorKey: "last_transaction_date",
    header: "Last Transaction",
    cell: ({ row }) => row.getValue("last_transaction_date")
      ? new Date(row.getValue("last_transaction_date")).toLocaleDateString()
      : '-',
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedCustomer({
          id: row.original.custId,
          name: row.original.custBusinessname,
          whatsapp: row.original.custWhatsapp
        })}
        className="text-black"
      >
        View Ledger
      </Button>
    ),
  },
];

export const paymentColumns: ColumnDef<any>[] = [
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("paymentDate")).toLocaleDateString(),
  },
  {
    accessorKey: "invoiceTable.invNumber",
    header: "Invoice Number",
    cell: ({ row }) => row.original.invoiceTable?.invNumber?.join("-"),
  },
  {
    accessorKey: "invoiceTable.customerMaster.custBusinessname",
    header: "Business Name",
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "paymentMode",
    header: "Payment Mode",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
];