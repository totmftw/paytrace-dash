export interface LedgerEntry {
  id: number;
  transaction_date: string;
  transaction_type: string;
  reference_number: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  description: string;
}

export interface CustomerLedgerProps {
  customerId: number;
  customerName: string;
  whatsappNumber: number;
  isOpen: boolean;
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