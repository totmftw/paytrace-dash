// src/types/database.ts
export interface Invoice {
    id: string;
    customer_id: string;
    invDate: string;
    dueDate: string;
    invAmount: number;
    status: string;
    created_at: string;
  }
  
  export interface Payment {
    id: string;
    invoice_id: string;
    amount: number;
    paymentDate: string;
    created_at: string;
  }
  
  export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
  }
  
  export interface DashboardLayout {
    id: string;
    created_by: string;
    layout: string;
    is_active: boolean;
    created_at: string;
  }
  