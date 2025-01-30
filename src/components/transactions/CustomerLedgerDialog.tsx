import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

interface CustomerLedgerDialogProps {
  customer: {
    custBusinessname: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  transactions: {
    id: string;
    transactionId: string;
    invoice?: {
      invNumber: string;
    };
    date: string;
    type: 'credit' | 'debit';
    amount: number;
    balance: number;
  }[];
}

export function CustomerLedgerDialog({ customer, isOpen, onClose, transactions }: CustomerLedgerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Customer Ledger - {customer?.custBusinessname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {transactions?.map((transaction) => (
            <div key={transaction.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Transaction ID: {transaction.transactionId}</p>
                  <p className="text-sm text-muted-foreground">
                    Invoice: {transaction.invoice?.invNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(transaction.balance)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
