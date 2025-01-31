export interface PaymentData {
  invId: number;
  transactionId: string;
  paymentDate: string;
  amount: number;
  paymentMode: 'cash' | 'cheque' | 'online';
  remarks: string;
  chequeNumber?: string;
  bankName?: string;
}

export interface LedgerEntry {
  transaction_date: string;
  transaction_type: string;
  reference_number: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  description: string;
}

export interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invTotal: number;
  customerMaster: {
    custBusinessname: string;
    custCreditperiod: number;
    custWhatsapp: number;
  };
  paymentTransactions: {
    amount: number;
    paymentId: number;
  }[];
}