export interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  debit?: number;
  credit?: number;
  balance: number;
  type: 'invoice' | 'payment';
}

export interface CustomerLedgerProps {
  customerId: number;
  customerName: string;
  whatsappNumber: string;
  onClose: () => void;
}