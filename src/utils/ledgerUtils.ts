import { Customer } from '@/types/customer';

interface LedgerEntry {
  date: string;
  description: string;
  transactionType: "invoice" | "payment";
  amount: number;
  balance: number;
}

export const calculateRunningBalance = (entries: LedgerEntry[]): LedgerEntry[] => {
  let balance = 0;
  return entries.map(entry => {
    if (entry.transactionType === "invoice") {
      balance += entry.amount;
    } else if (entry.transactionType === "payment") {
      balance -= entry.amount;
    }
    return { ...entry, balance };
  });
};

export const formatLedgerEntries = (
  customer: Customer,
  invoices: any[],
  payments: any[]
): LedgerEntry[] => {
  const entries: LedgerEntry[] = [];

  // Add invoice entries
  invoices.forEach(invoice => {
    entries.push({
      date: invoice.invDate,
      description: `Invoice #${invoice.invNumber}`,
      transactionType: "invoice",
      amount: invoice.invTotal,
      balance: 0, // Will be calculated later
    });
  });

  // Add payment entries
  payments.forEach(payment => {
    entries.push({
      date: payment.paymentDate,
      description: `Payment - ${payment.paymentMode}`,
      transactionType: "payment",
      amount: payment.amount,
      balance: 0, // Will be calculated later
    });
  });

  // Sort entries by date
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate running balance
  return calculateRunningBalance(entries);
};