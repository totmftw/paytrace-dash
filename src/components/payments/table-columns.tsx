import { formatCurrency } from "@/lib/utils";

export const balanceColumns = (
  setSelectedCustomer: (customer: { id: number; name: string; whatsapp: number; } | null) => void
) => [
  {
    key: "custBusinessname",
    header: "Business Name",
  },
  {
    key: "balance",
    header: "Balance",
    cell: (item: any) => formatCurrency(item.balance),
  },
  {
    key: "last_transaction_date",
    header: "Last Transaction",
    cell: (item: any) => item.last_transaction_date
      ? new Date(item.last_transaction_date).toLocaleDateString()
      : '-',
  },
  {
    key: "actions",
    header: "Actions",
    cell: (item: any) => (
      <button
        className="text-black hover:text-gray-700"
        onClick={() => setSelectedCustomer({
          id: item.custId,
          name: item.custBusinessname,
          whatsapp: item.custWhatsapp
        })}
      >
        View Ledger
      </button>
    ),
  },
];

export const paymentColumns = [
  {
    key: "paymentDate",
    header: "Date",
    cell: (item: any) => new Date(item.paymentDate).toLocaleDateString(),
  },
  {
    key: "invoiceTable.invNumber",
    header: "Invoice Number",
    cell: (item: any) => item.invoiceTable?.invNumber || '-',
  },
  {
    key: "invoiceTable.customerMaster.custBusinessname",
    header: "Business Name",
  },
  {
    key: "transactionId",
    header: "Transaction ID",
  },
  {
    key: "paymentMode",
    header: "Payment Mode",
  },
  {
    key: "amount",
    header: "Amount",
    cell: (item: any) => formatCurrency(item.amount),
  },
];