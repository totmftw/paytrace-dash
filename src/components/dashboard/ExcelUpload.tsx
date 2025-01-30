import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { read, utils } from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ExcelPaymentRow {
  InvoiceNumber: string;
  TransactionId: string;
  PaymentMode: string;
  ChequeNumber?: string;
  BankName?: string;
  PaymentDate: string;
  Amount: number;
  Remarks?: string;
}
// ExcelUpload.tsx
const processPayment = async (invoice: any, paymentAmount: number, row: ExcelPaymentRow) => {
  // ... Existing logic ...

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoiceTable")
    .select("invId, invTotal, invBalanceAmount, invCustid")
    .eq("invNumber", row.InvoiceNumber)
    .single();

  if (invoiceError) throw invoiceError;

  // ... Rest of the logic ...
};
export function ExcelUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processPayment = async (invoice: any, paymentAmount: number, row: ExcelPaymentRow) => {
    const { data: duplicateCheck } = await supabase.rpc('check_duplicate_payments', {
      p_inv_id: invoice.invId,
      p_transaction_id: row.TransactionId,
      p_payment_date: row.PaymentDate,
      p_amount: paymentAmount
    });

    if (duplicateCheck && duplicateCheck[0]?.is_duplicate) {
      throw new Error(`Duplicate payment detected for invoice ${row.InvoiceNumber}`);
    }

    const { error: paymentError } = await supabase
      .from('paymentTransactions')
      .insert({
        invId: invoice.invId,
        transactionId: row.TransactionId,
        paymentMode: row.PaymentMode,
        chequeNumber: row.ChequeNumber,
        bankName: row.BankName,
        paymentDate: row.PaymentDate,
        amount: paymentAmount,
        remarks: row.Remarks
      });

    if (paymentError) throw paymentError;

    const newBalanceAmount = Number(invoice.invBalanceAmount) - paymentAmount;
    const paymentStatus = newBalanceAmount <= 0 ? 'paid' : 'partial';

    const { error: updateError } = await supabase
      .from('invoiceTable')
      .update({
        invBalanceAmount: newBalanceAmount,
        invPaymentStatus: paymentStatus,
        invMarkcleared: newBalanceAmount <= 0
      })
      .eq('invId', invoice.invId);

    if (updateError) throw updateError;

    const { error: ledgerError } = await supabase
      .from('paymentLedger')
      .insert({
        custId: invoice.invCustid,
        invId: invoice.invId,
        transactionType: 'payment',
        amount: paymentAmount,
        runningBalance: newBalanceAmount,
        description: `Payment received for invoice ${row.InvoiceNumber}`
      });

    if (ledgerError) throw ledgerError;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    const errors: string[] = [];
    const processed: string[] = [];
    const notFoundInvoices: string[] = [];
    const networkErrors: string[] = [];

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet) as ExcelPaymentRow[];

          for (const row of jsonData) {
            try {
              const retryCount = 3;
              let lastError = null;
              let invoices = null;

              // Retry logic for network errors
              for (let i = 0; i < retryCount; i++) {
                try {
                  const { data: invoiceData, error: invoiceError } = await supabase
                    .from('invoiceTable')
                    .select('invId, invTotal, invBalanceAmount, invCustid')
                    .eq('invNumber', row.InvoiceNumber);
                  
                  if (!invoiceError) {
                    invoices = invoiceData;
                    break;
                  }
                  lastError = invoiceError;
                  await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
                } catch (err) {
                  lastError = err;
                  await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
              }

              if (lastError) {
                networkErrors.push(`Network error for invoice ${row.InvoiceNumber}: ${lastError.message}`);
                continue;
              }

              if (!invoices || invoices.length === 0) {
                notFoundInvoices.push(row.InvoiceNumber);
                continue;
              }

              const invoice = invoices[0];

              const paymentAmount = Number(row.Amount);
              if (isNaN(paymentAmount) || paymentAmount <= 0) {
                errors.push(`Invalid payment amount for invoice ${row.InvoiceNumber}`);
                continue;
              }

              await processPayment(invoice, paymentAmount, row);
              processed.push(row.InvoiceNumber);
            } catch (error: any) {
              errors.push(`Error processing invoice ${row.InvoiceNumber}: ${error.message}`);
            }
          }

          // Invalidate queries to refresh data
          await queryClient.invalidateQueries({ queryKey: ['invoices'] });
          await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

          // Show success message for processed payments
          if (processed.length > 0) {
            toast({
              title: "Success",
              description: `Successfully processed ${processed.length} payments`,
            });
          }

          // Show error message for failed payments
          if (errors.length > 0) {
            console.error('Payment upload errors:', errors);
            toast({
              variant: "destructive",
              title: "Some payments failed to process",
              description: `${errors.length} error(s) occurred. Check the console for details.`,
            });
          }

          // Show message for not found invoices
          if (notFoundInvoices.length > 0) {
            toast({
              variant: "destructive",
              title: "Invoices not found",
              description: `The following invoices were not found in the system: ${notFoundInvoices.join(', ')}`,
            });
          }

          // Show network errors
          if (networkErrors.length > 0) {
            toast({
              variant: "destructive",
              title: "Network Errors",
              description: `Network issues occurred with ${networkErrors.length} invoice(s). These will need to be retried.`,
            });
            console.error('Network errors:', networkErrors);
          }

        } catch (error: any) {
          console.error('File processing error:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to process file: ${error.message}`,
          });
        } finally {
          setUploading(false);
          event.target.value = '';
        }
      };

      reader.readAsArrayBuffer(event.target.files[0]);
    } catch (error: any) {
      setUploading(false);
      console.error('File reading error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to read file: ${error.message}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Button>
      )}
    </div>
  );
}