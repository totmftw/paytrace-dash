import { PaymentTransaction, Invoice as DBInvoice } from './dashboard';

export interface Invoice extends DBInvoice {
  customerMaster: {
    custBusinessname: string;
    custCreditperiod?: number;
    custWhatsapp: number;
  };
  paymentTransactions: PaymentTransaction[];
}

export interface Options {
  startDate: string;
  endDate: string;
  selectQuery?: string;
}

export interface Customer {
  id: number;
  custBusinessname: string;
  custWhatsapp: number;
}