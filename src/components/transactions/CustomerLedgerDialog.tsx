import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calculateRunningBalance, formatLedgerDate, sortLedgerEntries } from "@/utils/ledgerCalculations";
import { LedgerEntry } from "@/types/ledger";
import * as XLSX from 'xlsx';

interface CustomerLedgerDialogProps {
  customerId: number;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerLedgerDialog({
  customerId,
  customerName,
  isOpen,
  onClose,
}: CustomerLedgerDialogProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLedgerEntries() {
      try {
        // Fetch invoices
        const { data: invoices } = await supabase
          .from('invoiceTable')
          .select('invId, invNumber, invDate, invTotal')
          .eq('invCustid', customerId);

        // Fetch payments
        const { data: payments } = await supabase
          .from('paymentTransactions')
          .select('paymentId, transactionId, paymentDate, amount')
          .eq('invId', customerId);

        // Combine and format entries
        const ledgerEntries: LedgerEntry[] = [
          ...(invoices?.map(inv => ({
            id: inv.invId,
            date: inv.invDate,
            description: `Invoice #${inv.invNumber.join('-')}`,
            amount: inv.invTotal,
            type: 'invoice' as const,
            balance: 0, // Will be calculated
          })) || []),
          ...(payments?.map(pay => ({
            id: pay.paymentId,
            date: pay.paymentDate,
            description: `Payment (${pay.transactionId})`,
            amount: pay.amount,
            type: 'payment' as const,
            balance: 0, // Will be calculated
          })) || []),
        ];

        const sortedEntries = sortLedgerEntries(ledgerEntries);
        const entriesWithBalance = calculateRunningBalance(sortedEntries);
        setEntries(entriesWithBalance);
      } catch (error) {
        console.error('Error fetching ledger entries:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchLedgerEntries();
    }
  }, [customerId, isOpen]);

  const downloadLedger = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      entries.map(entry => ({
        Date: formatLedgerDate(entry.date),
        Description: entry.description,
        Debit: entry.type === 'invoice' ? entry.amount : '',
        Credit: entry.type === 'payment' ? entry.amount : '',
        Balance: entry.balance,
      }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');
    XLSX.writeFile(workbook, `${customerName}-ledger.xlsx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Customer Ledger - {customerName}</DialogTitle>
            <Button variant="outline" size="sm" onClick={downloadLedger}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="w-full overflow-x-auto">
            <table className="w-full dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Loading ledger entries...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No ledger entries found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={`${entry.type}-${entry.id}`}>
                      <td>{formatLedgerDate(entry.date)}</td>
                      <td>{entry.description}</td>
                      <td className="text-right">
                        {entry.type === 'invoice' ? entry.amount.toFixed(2) : '-'}
                      </td>
                      <td className="text-right">
                        {entry.type === 'payment' ? entry.amount.toFixed(2) : '-'}
                      </td>
                      <td className="text-right">{entry.balance.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}