import { PaymentTransaction, Invoice as DBInvoice } from './dashboard';

export interface Invoice extends DBInvoice {
  customerMaster: {
    custBusinessname: string;
    custCreditperiod?: number;
  };
  paymentTransactions: PaymentTransaction[];
}

export interface Options {
  startDate: string;
  endDate: string;
  selectQuery?: string;
}