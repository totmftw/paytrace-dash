import { LedgerEntry } from '@/types/types';

export const calculateTotalDebit = (entries: LedgerEntry[]): number => {
  return entries.reduce((total, entry) => {
    if (entry.transaction_type === 'DEBIT') {
      return total + entry.debit_amount;
    }
    return total;
  }, 0);
};

export const calculateTotalCredit = (entries: LedgerEntry[]): number => {
  return entries.reduce((total, entry) => {
    if (entry.transaction_type === 'CREDIT') {
      return total + entry.credit_amount;
    }
    return total;
  }, 0);
};

export const sortEntriesByDate = (entries: LedgerEntry[]): LedgerEntry[] => {
  return [...entries].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );
};