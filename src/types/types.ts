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
  invDuedate: string;
  invTotal: number;
  invBalanceAmount: number;
  invGst: number;
  invValue: number;
  invAddamount?: number;
  invSubamount?: number;
  invMarkcleared?: boolean;
  invMessage1?: string;
  fy: string;
  customerMaster: {
    custBusinessname: string;
    custCreditperiod: number;
    custWhatsapp: number;  // Changed from string to number to match database
  };
  paymentTransactions: {
    amount: number;
    paymentId: number;
  }[];
}

export type TableName = 
  | "custom_permissions"
  | "customer_ledger"
  | "customerMaster"
  | "dashboard_config"
  | "dashboard_layouts"
  | "dashboard_metrics"
  | "expenses"
  | "feature_permissions"
  | "invoiceTable"
  | "paymentTransactions"
  | "productManagement"
  | "role_permissions"
  | "user_profiles"
  | "whatsapp_config";