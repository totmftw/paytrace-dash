import { ReactElement } from 'react';

export interface DashboardWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: ReactElement;
}

export interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invBalanceAmount: number;
  invPaymentStatus: string;
  customerMaster: {
    custBusinessname: string;
  };
  paymentTransactions?: {
    amount: number;
    paymentDate: string;
  }[];
}

export interface MetricsSummary {
  pendingAmount: number;
  outstandingAmount: number;
  totalSales: number;
  totalOrders: number;
  pendingInvoices: Invoice[];
  outstandingInvoices: Invoice[];
  allInvoices: Invoice[];
}