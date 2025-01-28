import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Simplified type structure to prevent deep instantiation
interface LedgerTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  isInvoice: boolean;
}

interface CustomerLedgerProps {
  customerId: number;
  customerName: string;
  whatsappNumber: string;
  onClose: () => void;
}

export function CustomerLedgerDialog({ customerId, customerName, whatsappNumber, onClose }: CustomerLedgerProps) {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerTransaction[]>([]);
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

        const transactions: LedgerTransaction[] = [];

        // Process invoices
        if (invoicesResult.data) {
          transactions.push(...invoicesResult.data.map(inv => ({
            id: inv.invId,
            date: format(new Date(inv.invDate), 'yyyy-MM-dd'),
            description: `Invoice #${inv.invId}`,
            amount: inv.invTotal,
            isInvoice: true
          })));
        }

        // Process payments
        if (paymentsResult.data) {
          transactions.push(...paymentsResult.data.map(pay => ({
            id: pay.paymentId,
            date: format(new Date(pay.paymentDate), 'yyyy-MM-dd'),
            description: `Payment #${pay.paymentId}`,
            amount: pay.amount,
            isInvoice: false
          })));
        }

        // Sort by date
        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setLedgerEntries(transactions);
      } catch (error) {
        console.error("Error fetching ledger entries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLedgerEntries();
  }, [customerId]);

  // Calculate running balance
  const entriesWithBalance = ledgerEntries.reduce<(LedgerTransaction & { balance: number })[]>((acc, entry) => {
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const balance = entry.isInvoice 
      ? previousBalance + entry.amount 
      : previousBalance - entry.amount;
    
    acc.push({ ...entry, balance });
    return acc;
  }, []);

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
                {entriesWithBalance.map((entry) => (
                  <tr key={`${entry.isInvoice ? 'inv' : 'pay'}-${entry.id}`} className="border-b">
                    <td className="p-2">{entry.date}</td>
                    <td className="p-2">{entry.description}</td>
                    <td className="text-right p-2">
                      {entry.isInvoice ? entry.amount.toFixed(2) : '-'}
                    </td>
                    <td className="text-right p-2">
                      {!entry.isInvoice ? entry.amount.toFixed(2) : '-'}
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