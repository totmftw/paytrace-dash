
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
  custCreditperiod?: number;
  custWhatsapp?: number;
  custPhone: number;
  custGST: string;
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
  invAlert?: string;
  fy: string;
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface Customer {
  id: number;
  custBusinessname: string;
  custOwnername: string;
  custPhone: number;
  custWhatsapp?: number;
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

export interface InvoiceTableProps {
  selectedYear: string;
}

export interface SalesVsPaymentsChartProps {
  selectedYear: string;
}
