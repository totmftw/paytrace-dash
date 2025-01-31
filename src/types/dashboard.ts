// src/types/dashboard.ts
export interface DashboardLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }
  
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
  