// src/types/database.ts
export interface Invoice {
  invNumber: string;
  invDate: string;
  invDueDate: string;
  invTotalAmount: number;
  customerName: string;
}

export interface PaymentTransaction {
  invNumber: string;
  paymentAmount: number;
  paymentDate: string;
}

export interface DashboardLayout {
  id?: number;
  layout: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  created_at?: string;
  updated_at?: string;
}
