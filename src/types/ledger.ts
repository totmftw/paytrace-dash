export interface LedgerEntry {
  date: string;
  particulars: string;
  vchType: string;
  vchNo: string;
  debit: number | null;
  credit: number | null;
  balance?: number;
  type: 'Dr' | 'Cr';
}

export interface CustomerLedger {
  customerName: string;
  businessAddress: string;
  contactInfo: string;
  email: string;
  period: {
    from: string;
    to: string;
  };
  entries: LedgerEntry[];
  openingBalance: number;
  closingBalance: number;
}