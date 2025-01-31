export interface PaymentTransaction {
  paymentId: number;
  invId: number;
  amount: number;
  paymentDate: string;
  transactionId: string;
  paymentMode: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
}

export interface CustomerMaster {
  custBusinessname: string;
  custCreditperiod: number;
  custWhatsapp: number;
}

export interface Invoice {
  invId: number;
  invCustid?: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invValue: number;
  invGst: number;
  invTotal: number;
  invBalanceAmount: number;
  invPaymentStatus: string;
  invAddamount?: number;
  invSubamount?: number;
  invMarkcleared?: boolean;
  invMessage1: string;
  invMessage2?: string;
  invMessage3?: string;
  fy: string;
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface PaymentData {
  invId: number;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  transactionId: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
}

export interface LedgerEntry {
  transaction_date: string;
  description: string;
  invoice_number?: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  transaction_type: string;
}

export type TableName = 'invoiceTable' | 'customerMaster' | 'paymentTransactions';

export interface UserPreferences {
  columns?: string[];
}

export interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (order: string[]) => Promise<void>;
}

export interface CustomerTableProps {
  data: Invoice[];
  isLoading: boolean;
}
