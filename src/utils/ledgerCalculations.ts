import { LedgerEntry } from "@/types/types";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";

export const calculateRunningBalance = (entries: LedgerEntry[]): LedgerEntry[] => {
  let balance = 0;
  return entries.map(entry => {
    if (entry.transaction_type === 'invoice') {
      balance += entry.debit_amount;
    } else if (entry.transaction_type === 'payment') {
      balance -= entry.credit_amount;
    }
    return { ...entry, balance };
  });
};

export const formatLedgerDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const sortLedgerEntries = (entries: LedgerEntry[]) => {
  return entries.sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );
};

export const formatCurrency = formatCurrencyUtil;