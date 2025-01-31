import type { Json } from '@/integrations/supabase/types';

export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
  transactionId: string;
  paymentMode: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
  invId: number;
}

export interface CustomerMaster {
  custBusinessname: string;
  custCreditperiod: number;
  custWhatsapp: number;
}

export interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invValue: number;
  invGst: number;
  invBalanceAmount: number;
  invPaymentStatus: string;
  invMessage1: string;
  invMessage2?: string;
  invMessage3?: string;
  invAddamount?: number;
  invSubamount?: number;
  invMarkcleared?: boolean;
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

export type TableName = 'invoiceTable' | 'customerMaster' | 'paymentTransactions';

export interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (order: string[]) => Promise<void>;
}

export interface UserPreferences {
  columns?: string[];
}