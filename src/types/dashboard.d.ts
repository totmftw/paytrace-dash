import { ReactNode } from 'react';
import { Layout } from 'react-grid-layout';

export interface DashboardWidget extends Layout {
  id: string;
  content: ReactNode;
}

export interface LayoutData {
  layout: Layout[];
}

export interface DashboardProps {
  year: string;
}

export interface CustomerMaster {
  custBusinessname: string;
  custCreditperiod: number;
  custWhatsapp: number;
  custGST: string;
  custPhone: number;
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
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}