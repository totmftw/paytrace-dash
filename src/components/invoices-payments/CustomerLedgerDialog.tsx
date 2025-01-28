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
import { Download, Send } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { transformToLedgerEntries, type InvoiceData, type PaymentData } from "@/utils/ledgerUtils";

interface CustomerLedgerDialogProps {
  customerId: number;
  customerName: string;
  whatsappNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerLedgerDialog({
  customerId,
  customerName,
  whatsappNumber,
  isOpen,
  onClose,
}: CustomerLedgerDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["customer-ledger", customerId],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from("invoiceTable")
        .select("invDate, invGst, invNumber, invTotal")
        .eq("invCustid", customerId)
        .order("invDate", { ascending: true });

      const { data: payments } = await supabase
        .from("paymentTransactions")
        .select("paymentDate, paymentMode, transactionId, amount")
        .eq("invCustid", customerId)
        .order("paymentDate", { ascending: true });

      const entries = transformToLedgerEntries(
        invoices as InvoiceData[],
        payments as PaymentData[]
      );

      return {
        entries,
        openingBalance: 0,
        closingBalance: entries[entries.length - 1]?.balance || 0
      };
    }
  });

  const handleSendToWhatsApp = async () => {
    if (!ledgerData) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp-reminder', {
        body: {
          phone: whatsappNumber.toString(),
          message: `Dear ${customerName},\n\nPlease find your ledger statement attached. Your current balance is ${formatCurrency(ledgerData.closingBalance)}.\n\nRegards,\nTeam`,
          type: 'ledger',
          ledgerData: ledgerData
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ledger statement has been sent via WhatsApp",
      });
    } catch (error) {
      console.error('Error sending ledger:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send ledger via WhatsApp",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{customerName} - Ledger Statement</DialogTitle>
          <div className="absolute right-4 top-4 flex gap-2">
            <Button
              onClick={handleSendToWhatsApp}
              variant="outline"
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send to WhatsApp"}
            </Button>
            <Button
              onClick={() => window.open(`/api/ledger-pdf/${customerId}`, '_blank')}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
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
                    {formatCurrency(entry.balance)}
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