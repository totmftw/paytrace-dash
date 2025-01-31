import { ReactElement } from 'react';

export interface DashboardWidget {
  id: string;
  content: ReactElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
}

export interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invBalanceAmount: number;
  customerMaster: {
    custBusinessname: string;
  };
  paymentTransactions?: PaymentTransaction[];
}