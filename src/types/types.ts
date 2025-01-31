export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
  transactionId?: string;
  paymentMode?: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
}

export interface CustomerMaster {
  custBusinessname: string;
  custCreditperiod?: number;
  custWhatsapp?: number;
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
  amount: number;
  paymentDate: string;
  paymentMode: string;
  transactionId: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
}

export interface LedgerEntry {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}