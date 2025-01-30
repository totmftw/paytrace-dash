import { LedgerEntry } from "@/types/ledger";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";

export const calculateRunningBalance = (entries: LedgerEntry[]): LedgerEntry[] => {
  let balance = 0;
  return entries.map(entry => {
    if (entry.type === 'invoice') {
      balance += entry.amount;
    } else if (entry.type === 'payment') {
      balance -= entry.amount;
    }
    return { ...entry, balance };
  });
};

export const formatLedgerDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const formatCurrency = formatCurrencyUtil;

export const sortLedgerEntries = (entries: LedgerEntry[]) => {
  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};