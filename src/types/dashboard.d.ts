import { ReactNode } from 'react';
import { Layout } from 'react-grid-layout';

export interface LayoutData {
  layout: Layout[];
}

export interface DashboardProps {
  year?: string;
}

export interface MetricsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  isMonetary?: boolean;
  onClick?: () => void;
}

export interface DashboardWidget extends Layout {
  id: string;
  content: ReactNode;
}

export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
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
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface MetricsSummary {
  totalSales: number;
  pendingPayments: number;
  outstandingPayments: number;
  totalInvoices: number;
}