export interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
  transactionId?: string;
  paymentMode?: string;
  chequeNumber?: string;
  bankName?: string;
  remarks?: string;
}

export interface CustomerMaster {
  custBusinessname: string;
  custCreditperiod: number;
  custWhatsapp: number;
}

export interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  invValue: number;
  invGst: number;
  invBalanceAmount: number;
  invAddamount?: number;
  invSubamount?: number;
  invMarkcleared?: boolean;
  invMessage1?: string;
  fy: string;
  customerMaster: CustomerMaster;
  paymentTransactions: PaymentTransaction[];
}

export interface Customer {
  id: number;
  custBusinessname: string;
  custWhatsapp: number;
  custCreditperiod: number;
}

export interface Options {
  startDate: string;
  endDate: string;
  selectQuery?: string;
}

export interface PDFExportProps {
  onExport?: () => void;
  fileName?: string;
}

export interface DataTableProps<T> {
  columns: {
    accessorKey: string;
    header: string;
    cell?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  isLoading?: boolean;
}

export interface CustomerSelectorProps {
  selectedCustomerId: number | null;
  onSelect: (id: number | null) => void;
  customers?: Customer[];
  isLoading?: boolean;
}