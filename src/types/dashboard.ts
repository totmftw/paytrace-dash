import { Layout } from 'react-grid-layout';
import { ReactNode } from 'react';

export interface DashboardWidget extends Layout {
  id: string;
  content: ReactNode;
}

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
  custGST?: string;
  custPhone?: number;
}

export interface Invoice {
  invId: number;
  invCustid?: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invValue: number;
  invGst: number;
  invTotal: number;
  invBalanceAmount: number;
  invPaymentStatus: string;
  invAddamount?: number;
  invSubamount?: number;
  invMarkcleared?: boolean;
  invMessage1: string;
  invMessage2?: string;
  invMessage3?: string;
  fy: string;
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface MetricsSummary {
  totalSales: number;
  pendingPayments: number;
  outstandingPayments: number;
  totalInvoices: number;
}

export interface LayoutData {
  layout: Layout[];
}

export interface LayoutItem extends Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MetricsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  isMonetary?: boolean;
  onClick?: () => void;
}

export interface DashboardProps {
  year?: string;
}