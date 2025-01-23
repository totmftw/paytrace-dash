import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentLedgerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  whatsappNumber: number;
}

export function PaymentLedgerDialog({
  isOpen,
  onClose,
  customerId,
  customerName,
  whatsappNumber
}: PaymentLedgerDialogProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  const { data: transactions } = useQuery({
    queryKey: ['ledger', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paymentLedger')
        .select('*')
        .eq('custId', customerId)
        .order('createdAt', { ascending: true });
        
      if (error) throw error;
      return data;
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
                { type: "text", text: formatCurrency(transactions?.reduce((acc, t) => 
                  acc + (t.transactionType === 'invoice' ? t.amount : -t.amount), 0) || 0) }
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
          <DialogTitle>Payment Ledger - {customerName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end mb-4">
          <Button onClick={sendLedgerToWhatsApp} disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send to WhatsApp"}
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {transactions?.map((transaction) => (
              <div
                key={transaction.ledgerId}
                className={`p-4 rounded-lg border ${
                  transaction.transactionType === 'invoice'
                    ? 'border-red-200 bg-red-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {transaction.transactionType === 'invoice' ? 'Invoice' : 'Payment'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.transactionType === 'invoice'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {transaction.transactionType === 'invoice' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {formatCurrency(transaction.runningBalance)}
                    </p>
                  </div>
                </div>
                {transaction.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {transaction.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}