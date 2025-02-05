import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type TransactionType = 'invoice' | 'payment';

interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  balance: number;
}

type CustomerLedgerProps = {
  customerId: number;
  customerName: string;
  whatsappNumber: string;
  onClose: () => void;
}

export function CustomerLedgerDialog({ customerId, customerName, whatsappNumber, onClose }: CustomerLedgerProps) {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLedgerEntries() {
      try {
        const { data: ledgerData, error } = await supabase
          .from('paymentLedger')
          .select('*')
          .eq('custId', customerId)
          .order('createdAt');

        if (error) throw error;

        if (ledgerData) {
          const entries: LedgerEntry[] = ledgerData.map(entry => ({
            id: entry.ledgerId,
            date: format(new Date(entry.createdAt), 'yyyy-MM-dd'),
            description: entry.description || `${entry.transactionType} #${entry.ledgerId}`,
            amount: entry.amount,
            type: entry.transactionType as TransactionType,
            balance: entry.runningBalance
          }));

          setLedgerEntries(entries);
        }
      } catch (error) {
        console.error("Error fetching ledger entries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLedgerEntries();
  }, [customerId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Customer Ledger - {customerName}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-4">Loading ledger entries...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Debit</th>
                  <th className="text-right p-2">Credit</th>
                  <th className="text-right p-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={`${entry.type}-${entry.id}`} className="border-b">
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.description}</td>
                    <td className="text-right p-2">{entry.type === 'invoice' ? entry.amount.toFixed(2) : '-'}</td>
                    <td className="text-right p-2">{entry.type === 'payment' ? entry.amount.toFixed(2) : '-'}</td>
                    <td className="text-right p-2">{entry.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}