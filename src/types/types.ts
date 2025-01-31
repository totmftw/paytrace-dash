import type { Json } from '@/integrations/supabase/types';

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
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
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
  customerMaster?: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface UserPreferences {
  columns?: string[];
}

export interface ColumnConfigContextType {
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnOrder: (order: string[]) => Promise<void>;
}