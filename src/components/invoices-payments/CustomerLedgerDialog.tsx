import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Simplified transaction type
type TransactionType = 'invoice' | 'payment';

// Flat interface structure for ledger entries
interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  balance: number;
}

interface CustomerLedgerProps {
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
        const [invoicesResult, paymentsResult] = await Promise.all([
          supabase
            .from("invoiceTable")
            .select("invId, invDate, invTotal")
            .eq("invCustid", customerId)
            .order("invDate"),
          supabase
            .from("paymentTransactions")
            .select("paymentId, paymentDate, amount")
            .eq("custId", customerId)
            .order("paymentDate")
        ]);

        const entries: LedgerEntry[] = [];
        let runningBalance = 0;

        // Process invoices
        if (invoicesResult.data) {
          invoicesResult.data.forEach(inv => {
            runningBalance += inv.invTotal;
            entries.push({
              id: inv.invId,
              date: format(new Date(inv.invDate), 'yyyy-MM-dd'),
              description: `Invoice #${inv.invId}`,
              amount: inv.invTotal,
              type: 'invoice',
              balance: runningBalance
            });
          });
        }

        // Process payments
        if (paymentsResult.data) {
          paymentsResult.data.forEach(pay => {
            runningBalance -= pay.amount;
            entries.push({
              id: pay.paymentId,
              date: format(new Date(pay.paymentDate), 'yyyy-MM-dd'),
              description: `Payment #${pay.paymentId}`,
              amount: pay.amount,
              type: 'payment',
              balance: runningBalance
            });
          });
        }

        // Sort by date
        entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Recalculate running balance after sorting
        let balance = 0;
        entries.forEach(entry => {
          balance = entry.type === 'invoice' 
            ? balance + entry.amount 
            : balance - entry.amount;
          entry.balance = balance;
        });

        setLedgerEntries(entries);
      } catch (error) {
        console.error("Error fetching ledger entries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLedgerEntries();
  }, [customerId]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
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
                    <td className="text-right p-2">
                      {entry.type === 'invoice' ? entry.amount.toFixed(2) : '-'}
                    </td>
                    <td className="text-right p-2">
                      {entry.type === 'payment' ? entry.amount.toFixed(2) : '-'}
                    </td>
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