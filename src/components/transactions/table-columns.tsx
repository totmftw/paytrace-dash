import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export type LedgerEntry = {
  transaction_date: string;
  description: string;
  invoice_number: string;
  debit: number;
  credit: number;
  balance: number;
};

export const columns = [
  {
    key: "transaction_date",
    header: "Date",
    cell: (item: LedgerEntry) => {
      return item.transaction_date ? format(new Date(item.transaction_date), "dd/MM/yyyy") : "-";
    },
  },
  {
    key: "description",
    header: "Description",
    cell: (item: LedgerEntry) => item.description,
  },
  {
    key: "invoice_number",
    header: "Invoice Number",
    cell: (item: LedgerEntry) => {
      return item.invoice_number ? (
        <span className="table-link">
          {item.invoice_number}
        </span>
      ) : "-";
    },
  },
  {
    key: "debit",
    header: "Debit",
    cell: (item: LedgerEntry) => {
      return item.debit ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(item.debit) : "-";
    },
  },
  {
    key: "credit",
    header: "Credit",
    cell: (item: LedgerEntry) => {
      return item.credit ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(item.credit) : "-";
    },
  },
  {
    key: "balance",
    header: "Balance",
    cell: (item: LedgerEntry) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(item.balance);
    },
  },
];