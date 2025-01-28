import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Download } from "lucide-react";
import { format } from "date-fns";
import type { LedgerEntry } from "@/types/ledger";

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
  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["customer-ledger", customerId],
    queryFn: async () => {
      // Fetch both invoices and payments for the customer
      const { data: invoices } = await supabase
        .from("invoiceTable")
        .select("*")
        .eq("invCustid", customerId)
        .order("invDate", { ascending: true });

      const { data: payments } = await supabase
        .from("paymentTransactions")
        .select("*")
        .eq("invCustid", customerId)
        .order("paymentDate", { ascending: true });

      // Combine and sort entries
      const entries: LedgerEntry[] = [
        ...(invoices || []).map((inv) => ({
          date: inv.invDate,
          particulars: `GST Sales @ ${inv.invGst}%`,
          vchType: "MARG TALLY BILL",
          vchNo: inv.invNumber.join("-"),
          debit: inv.invTotal,
          credit: null,
          type: "Dr"
        })),
        ...(payments || []).map((pay) => ({
          date: pay.paymentDate,
          particulars: pay.paymentMode.toUpperCase(),
          vchType: "Receipt",
          vchNo: pay.transactionId,
          debit: null,
          credit: pay.amount,
          type: "Cr"
        }))
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate running balance
      let balance = 0;
      entries.forEach(entry => {
        if (entry.debit) balance += entry.debit;
        if (entry.credit) balance -= entry.credit;
        entry.balance = balance;
      });

      return {
        entries,
        openingBalance: 0, // You might want to fetch this from somewhere
        closingBalance: balance
      };
    }
  });

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{customerName} - Ledger Statement</DialogTitle>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="absolute right-4 top-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogHeader>
        
        <ScrollArea className="h-full mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>Vch Type</TableHead>
                <TableHead>Vch No.</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>Opening Balance</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(ledgerData?.openingBalance || 0)}
                </TableCell>
              </TableRow>
              {ledgerData?.entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(entry.date), "dd-MMM-yy")}</TableCell>
                  <TableCell>{entry.particulars}</TableCell>
                  <TableCell>{entry.vchType}</TableCell>
                  <TableCell>{entry.vchNo}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit ? formatCurrency(entry.debit) : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit ? formatCurrency(entry.credit) : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.balance || 0)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6}>Closing Balance</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(ledgerData?.closingBalance || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}