import { LedgerEntry } from '@/types/types';

export const formatLedgerEntry = (entry: LedgerEntry) => ({
  ...entry,
  transaction_date: new Date(entry.transaction_date).toLocaleDateString(),
  debit_amount: entry.debit_amount.toFixed(2),
  credit_amount: entry.credit_amount.toFixed(2),
  balance: entry.balance.toFixed(2),
});

export const calculateRunningBalance = (entries: LedgerEntry[]): LedgerEntry[] => {
  let balance = 0;
  return entries.map(entry => {
    balance += entry.debit_amount - entry.credit_amount;
    return { ...entry, balance };
  });
};