import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LedgerEntry {
  date: string;
  particulars: string;
  vchType: string;
  vchNo: string;
  debit?: number;
  credit?: number;
  balance: number;
}

interface CustomerLedgerDialogProps {
  customerId: number;
  customerName: string;
  whatsappNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerLedgerDialog({
  isOpen,
  onClose,
  customerId,
  customerName,
  whatsappNumber
}: CustomerLedgerDialogProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  const { data: ledgerEntries } = useQuery({
    queryKey: ['ledger', customerId],
    queryFn: async () => {
      // Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoiceTable')
        .select('invDate, invNumber, invTotal, invGst')
        .eq('invCustid', customerId)
        .order('invDate', { ascending: true });

      if (invoicesError) throw invoicesError;

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('paymentTransactions')
        .select('paymentDate, paymentMode, transactionId, amount')
        .eq('invId', customerId)
        .order('paymentDate', { ascending: true });

      if (paymentsError) throw paymentsError;

      const entries: LedgerEntry[] = [];
      let balance = 0;

      // Process invoices
      invoices?.forEach((inv) => {
        balance += inv.invTotal;
        entries.push({
          date: inv.invDate,
          particulars: `Invoice`,
          vchType: "Invoice",
          vchNo: inv.invNumber.join("-"),
          debit: inv.invTotal,
          balance,
        });
      });

      // Process payments
      payments?.forEach((payment) => {
        balance -= payment.amount;
        entries.push({
          date: payment.paymentDate,
          particulars: `Payment - ${payment.paymentMode}`,
          vchType: "Payment",
          vchNo: payment.transactionId,
          credit: payment.amount,
          balance,
        });
      });

      return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  const sendLedgerToWhatsApp = async () => {
    setSending(true);
    try {
      const { data: config } = await supabase
        .from('whatsapp_config')
        .select('*')
        .single();

      if (!config) {
        throw new Error('WhatsApp configuration not found');
      }

      const response = await fetch('/api/send-whatsapp-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: whatsappNumber.toString(),
          template: config.template_name,
          namespace: config.template_namespace,
          apiKey: config.api_key,
          fromPhoneNumberId: config.from_phone_number_id,
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: customerName },
                { type: "text", text: ledgerEntries?.[ledgerEntries.length - 1]?.balance.toString() || "0" }
              ]
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      toast({
        title: "Success",
        description: "Ledger sent successfully via WhatsApp",
      });
    } catch (error) {
      console.error('Error sending ledger:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send ledger via WhatsApp",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ledger: {customerName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end mb-4">
          <Button onClick={sendLedgerToWhatsApp} disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send to WhatsApp"}
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {ledgerEntries?.map((entry, index) => (
              <div
                key={`${entry.vchType}-${entry.vchNo}-${index}`}
                className={`p-4 rounded-lg border ${
                  entry.debit ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{entry.vchType}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      entry.debit ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {entry.debit ? `-${entry.debit}` : `+${entry.credit}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {entry.balance}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {entry.particulars} - {entry.vchNo}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}