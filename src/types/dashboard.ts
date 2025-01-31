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
  invPaymentStatus: string;
  fy: string;
  invAddamount?: number;
  invAlert?: string;
  invGst: number;
  invMarkcleared?: boolean;
  invMessage1: string;
  customerMaster: {
    custBusinessname: string;
    custCreditperiod?: number;
  };
  paymentTransactions: PaymentTransaction[];
}

export interface MetricsSummary {
  totalSales: number;
  pendingPayments: number;
  outstandingPayments: number;
  totalInvoices: number;
}