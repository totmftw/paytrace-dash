import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { LedgerEntry, CustomerLedgerProps } from "@/types/ledger";

export function CustomerLedgerDialog({ customerId, customerName, whatsappNumber, onClose }: CustomerLedgerProps) {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLedgerEntries() {
      try {
        // Fetch invoices
        const { data: invoices } = await supabase
          .from("invoiceTable")
          .select("invId, invDate, invTotal")
          .eq("invCustid", customerId)
          .order("invDate");

        // Fetch payments
        const { data: payments } = await supabase
          .from("paymentTransactions")
          .select("paymentId, paymentDate, amount")
          .eq("custId", customerId)
          .order("paymentDate");

        // Combine and sort entries
        const entries: LedgerEntry[] = [
          ...(invoices?.map(inv => ({
            id: inv.invId,
            date: format(new Date(inv.invDate), 'yyyy-MM-dd'),
            description: `Invoice #${inv.invId}`,
            debit: inv.invTotal,
            credit: undefined,
            balance: 0,
            type: 'invoice' as const
          })) || []),
          ...(payments?.map(pay => ({
            id: pay.paymentId,
            date: format(new Date(pay.paymentDate), 'yyyy-MM-dd'),
            description: `Payment #${pay.paymentId}`,
            debit: undefined,
            credit: pay.amount,
            balance: 0,
            type: 'payment' as const
          })) || [])
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate running balance
        let balance = 0;
        entries.forEach(entry => {
          if (entry.debit) balance += entry.debit;
          if (entry.credit) balance -= entry.credit;
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
                      {entry.debit?.toFixed(2) || '-'}
                    </td>
                    <td className="text-right p-2">
                      {entry.credit?.toFixed(2) || '-'}
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