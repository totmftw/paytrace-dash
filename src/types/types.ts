export type TableNames = 
  | "user_management" 
  | "customerMaster" 
  | "feature_permissions" 
  | "invoice_reminder_status" 
  | "invoiceTable" 
  | "user_profiles" 
  | "custom_permissions" 
  | "customer_ledger" 
  | "customer_ledger_balance" 
  | "dashboard_config" 
  | "dashboard_layouts" 
  | "dashboard_metrics" 
  | "financial_year_ranges" 
  | "paymentLedger" 
  | "paymentTransactions" 
  | "productManagement" 
  | "whatsapp_config";

export interface Customer {
  id: number;
  custBusinessname: string;
  custOwnername: string;
  custPhone: number;
  custWhatsapp: number;
  custOwnerphone: number;
  custOwnerwhatsapp: number;
  custEmail: string;
  custOwneremail?: string;
  custType: string;
  custAddress?: string;
  custProvince?: string;
  custCity?: string;
  custPincode?: number;
  custGST: string;
  custRemarks?: string;
  custStatus: string;
  custCreditperiod?: number;
}

export interface Invoice {
  invId: number;
  invCustid?: number;
  invNumber: string;
  invDate?: string;
  invDuedate?: string;
  invValue: number;
  invGst: number;
  invAddamount?: number;
  invSubamount?: number;
  invTotal: number;
  invReminder1?: boolean;
  invRemainder2?: boolean;
  invRemainder3?: boolean;
  invMarkcleared?: boolean;
  invAlert?: string;
  invMessage1: string;
  invMessage2?: string;
  invMessage3?: string;
  invBalanceAmount?: number;
  invPaymentDifference?: number;
  invPaymentStatus?: string;
  fy: string;
  customerMaster?: Customer;
}

export interface Payment {
  paymentId: number;
  invId: number;
  transactionId: string;
  paymentMode: string;
  chequeNumber?: string;
  bankName?: string;
  paymentDate: string;
  amount: number;
  remarks?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export interface LedgerEntry {
  date: string;
  description: string;
  transactionType: "invoice" | "payment";
  amount: number;
  balance: number;
  reference: string; // invNumber or transactionId
}