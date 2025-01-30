export interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note';
  balance: number;
}

export interface CustomerLedgerProps {
  customerId: number;
  customerName: string;
  whatsappNumber: string;
  onClose: () => void;
}

export interface CustomerLedgerSummary {
  customerId: number;
  customerName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  lastTransactionDate: string;
}