import { Customer } from '@/types/customer';



export const calculateRunningBalance = (entries: any[]): any[] => {
  let balance = 0;
  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(entry => {
    if (entry.type === 'invoice') {
      balance += entry.amount;
    } else if (entry.type === 'payment') {
      balance -= entry.amount;
    }
    return { ...entry, balance: formatCurrency(balance) };
  });
};
interface LedgerEntry {
  date: string;
  description: string;
  transactionType: "invoice" | "payment";
  amount: number;
  balance: number;
}
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
export const processInvoiceAndPaymentData = (invoices: any[], payments: any[]) => {
  const combinedEntries = [...invoices, ...payments];

  // Sort combined entries by date
  combinedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate running balance
  let balance = 0;
  return combinedEntries.map((entry) => {
    if (entry.type === "invoice") {
      balance += entry.amount;
    } else if (entry.type === "payment") {
      balance -= entry.amount;
    }
    return { ...entry, balance };
  });
};