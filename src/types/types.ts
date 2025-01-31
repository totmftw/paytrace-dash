// src/types/types.ts
export interface CustomerMaster {
  custId: number;
  custName: string;
  custEmail: string;
  custPhone: string;
  custAddress: string;
  custGst: string;
  custCreditperiod: number;
  custStatus: boolean;
  custCreatedAt: string;
  custUpdatedAt: string;
}

export interface Invoice {
  invId: number;
  invCustid: number;
  invDate: string;
  invDuedate: string;
  invAmount: number;
  invGst: number;
  invAddamount: number;
  invBalanceAmount: number;
  invMessage1: string;
  invMessage2: string;
  invAlert: string;
  invMarkcleared: boolean;
  fy: string;
  customerMaster?: CustomerMaster;
  paymentTransactions?: PaymentTransaction[];
}

export interface PaymentTransaction {
  transactionId: number;
  invId: number;
  paymentId: number;
  amount: number;
  paymentDate: string;
  paymentMode: string;
}
