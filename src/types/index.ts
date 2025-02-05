
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
  custPhone: number;
  custGST: string;
  custStatus: string; // Added this field
}

export interface Invoice {
  invId: number;
  invCustid?: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invValue: number;
  invGst: number;
  invBalanceAmount: number;
  invAddamount?: number;
  invSubamount?: number;
  invMarkcleared?: boolean;
  invMessage1: string;
  invMessage2?: string;
  invMessage3?: string;
  invPaymentStatus: string;
  fy: string;
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface InvoiceTableProps {
  selectedYear: string;
}

export interface SalesVsPaymentsChartProps {
  selectedYear: string;
}
