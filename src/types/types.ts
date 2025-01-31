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

export interface LedgerEntry {
  transaction_date: string;
  transaction_type: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  description: string;
}

export type TableName = 'invoiceTable' | 'customerMaster' | 'paymentTransactions';