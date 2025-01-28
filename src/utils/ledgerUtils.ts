import { LedgerEntry } from "@/types/ledger";

export interface InvoiceData {
  invDate: string;
  invGst: number;
  invNumber: number[];
  invTotal: number;
}

export interface PaymentData {
  paymentDate: string;
  paymentMode: string;
  transactionId: string;
  amount: number;
}

export const transformToLedgerEntries = (
  invoices: InvoiceData[] = [],
  payments: PaymentData[] = []
): LedgerEntry[] => {
  const entries: LedgerEntry[] = [];
  let balance = 0;

  const combined = [
    ...invoices.map(inv => ({
      date: inv.invDate,
      isInvoice: true,
      amount: inv.invTotal,
      data: inv
    })),
    ...payments.map(pay => ({
      date: pay.paymentDate,
      isInvoice: false,
      amount: pay.amount,
      data: pay
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  combined.forEach(item => {
    if (item.isInvoice) {
      const inv = item.data as InvoiceData;
      balance += inv.invTotal;
      entries.push({
        date: inv.invDate,
        particulars: `GST Sales @ ${inv.invGst}%`,
        vchType: "MARG TALLY BILL",
        vchNo: inv.invNumber.join("-"),
        debit: inv.invTotal,
        credit: null,
        balance,
        type: "Dr"
      });
    } else {
      const pay = item.data as PaymentData;
      balance -= pay.amount;
      entries.push({
        date: pay.paymentDate,
        particulars: pay.paymentMode.toUpperCase(),
        vchType: "Receipt",
        vchNo: pay.transactionId,
        debit: null,
        credit: pay.amount,
        balance,
        type: "Cr"
      });
    }
  });

  return entries;
};