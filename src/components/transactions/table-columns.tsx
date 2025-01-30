import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "transaction_date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("transaction_date");
      return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "invoice_number",
    header: "Invoice Number",
    cell: ({ row }) => {
      const invoiceNumber = row.getValue("invoice_number");
      return invoiceNumber ? (
        <span className="text-forest-green hover:text-forest-green/80">
          {invoiceNumber}
        </span>
      ) : "-";
    },
  },
  {
    accessorKey: "debit",
    header: "Debit",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("debit"));
      return amount ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(amount) : "-";
    },
  },
  {
    accessorKey: "credit",
    header: "Credit",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("credit"));
      return amount ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(amount) : "-";
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("balance"));
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(amount);
    },
  },
];