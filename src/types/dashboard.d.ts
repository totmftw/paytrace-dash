export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
  transactionId: string;
  paymentMode: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
}
export interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invPaymentStatus: string;
  customerMaster: {
    custBusinessname: string;
    custCreditperiod: number;
  };
  paymentTransactions: {
    paymentId: number;
    amount: number;
    paymentDate: string;
    transactionId: string;
    paymentMode: string;
    chequeNumber: string;
    bankName: string;
    remarks: string;
  }[];
}

export interface MetricsSummary {
  totalSales: number;
  pendingPayments: number;
  outstandingPayments: number;
  totalInvoices: number;
  invoices: Invoice[];
}
export interface Invoice {
  invId: number;
  invCustid: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
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
  invBalanceAmount: number;
  invPaymentDifference: number;
  invPaymentStatus: string;
  fy: string;
  paymentTransactions: PaymentTransaction[];
  customerMaster?: {
    custBusinessname: string;
  };
}

export interface DashboardWidget {
  i: string;
  id: string;
  content: React.ReactNode;
  x: number;
  y: number;
  w: number;
  h: number;
}