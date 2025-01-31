export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
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
  fy: string;
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
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
