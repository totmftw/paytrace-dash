import { LedgerEntry } from "@/types/types";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";

export const calculateRunningBalance = (entries: LedgerEntry[]): LedgerEntry[] => {
  let balance = 0;
  return entries.map(entry => {
    balance = balance + entry.debit_amount - entry.credit_amount;
    return { ...entry, balance };
  });
};

export const formatLedgerDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const formatCurrency = formatCurrencyUtil;

export const sortLedgerEntries = (entries: LedgerEntry[]) => {
  return entries.sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );
};