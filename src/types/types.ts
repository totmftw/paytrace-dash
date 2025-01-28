export interface CustomerInvoice {
    invoiceId: string;
    customerName: string;
    invoiceNumber: string;
    invoiceTotalValue: number;
    outstandingAmount: number;
  }
  
  export type UserRoles = "Owner" | "ITAdmin" | "User";