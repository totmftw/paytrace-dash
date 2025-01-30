import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { PaymentForm } from "@/components/invoices/PaymentForm";
import { useQueryClient } from "@tanstack/react-query";

interface ExcelRowData {
  InvoiceNumber: string;
  TransactionId: string;
  PaymentMode: string;
  ChequeNumber?: string;
  BankName?: string;
  PaymentDate: string;
  Amount: string;
  Remarks?: string;
}

export function ExcelUpload() {
  const [uploading, setUploading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{
    invId: number;
    invTotal: number;
    invBalanceAmount: number;
    invCustid: number;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const errors: string[] = [];
    const processed: string[] = [];

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRowData[];

          console.log("Processing payment data:", jsonData);

          for (const row of jsonData) {
            try {
              // First, verify the invoice exists and get its details
              const { data: invoice, error: invoiceError } = await supabase
                .from('invoiceTable')
                .select('invId, invTotal, invBalanceAmount, invCustid')
                .eq('invNumber', row.InvoiceNumber)
                .single();

              if (invoiceError || !invoice) {
                errors.push(`Invoice ${row.InvoiceNumber} not found`);
                continue;
              }

              const paymentAmount = Number(row.Amount);
              if (isNaN(paymentAmount) || paymentAmount <= 0) {
                errors.push(`Invalid payment amount for invoice ${row.InvoiceNumber}`);
                continue;
              }

              // Check for duplicate payments
              const { data: duplicateCheck } = await supabase
                .rpc('check_duplicate_payments', {
                  p_inv_id: invoice.invId,
                  p_transaction_id: row.TransactionId,
                  p_payment_date: row.PaymentDate,
                  p_amount: paymentAmount
                });

              if (duplicateCheck?.[0]?.is_duplicate) {
                errors.push(`Duplicate payment detected for invoice ${row.InvoiceNumber}`);
                continue;
              }

              const balanceAmount = invoice.invBalanceAmount || invoice.invTotal;
              const paymentDifference = balanceAmount - paymentAmount;

              // Insert payment record
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
                  remarks: row.Remarks,
                });

              if (paymentError) {
                errors.push(`Failed to record payment for invoice ${row.InvoiceNumber}: ${paymentError.message}`);
                continue;
              }

              // Update invoice payment status
              const { error: invoiceUpdateError } = await supabase
                .from('invoiceTable')
                .update({
                  invBalanceAmount: paymentDifference,
                  invPaymentDifference: paymentDifference,
                  invPaymentStatus: paymentDifference <= 0 ? 'paid' : 
                                  paymentDifference < balanceAmount ? 'partial' : 'pending',
                  invMarkcleared: paymentDifference <= 0,
                })
                .eq('invId', invoice.invId);

              if (invoiceUpdateError) {
                errors.push(`Failed to update invoice ${row.InvoiceNumber}: ${invoiceUpdateError.message}`);
                continue;
              }

              // Create ledger entry
              const { error: ledgerError } = await supabase
                .from('paymentLedger')
                .insert({
                  invId: invoice.invId,
                  custId: invoice.invCustid,
                  transactionType: 'payment',
                  amount: paymentAmount,
                  runningBalance: paymentDifference,
                  description: `Payment received via ${row.PaymentMode}${row.Remarks ? ` - ${row.Remarks}` : ''}`,
                });

              if (ledgerError) {
                errors.push(`Failed to create ledger entry for invoice ${row.InvoiceNumber}: ${ledgerError.message}`);
                continue;
              }

              processed.push(row.InvoiceNumber);

            } catch (error: any) {
              errors.push(`Error processing invoice ${row.InvoiceNumber}: ${error.message}`);
            }
          }

          // Invalidate and refetch relevant queries
          await queryClient.invalidateQueries({ queryKey: ['payments'] });
          await queryClient.invalidateQueries({ queryKey: ['invoices'] });
          await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

          if (processed.length > 0) {
            toast({
              title: "Success",
              description: `Successfully processed ${processed.length} payments${errors.length > 0 ? '. Some errors occurred.' : ''}`,
            });
          }

          if (errors.length > 0) {
            console.error('Payment upload errors:', errors);
            toast({
              variant: "destructive",
              title: "Some payments failed to process",
              description: `${errors.length} error(s) occurred. Check the console for details.`,
            });
          }

        } catch (error: any) {
          console.error('Processing error:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to process payment data",
          });
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload payment data",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        InvoiceNumber: '24-01-0001',
        TransactionId: 'TXN123',
        PaymentMode: 'cash',
        ChequeNumber: '',
        BankName: '',
        PaymentDate: '2024-01-21',
        Amount: '1000',
        Remarks: 'Initial payment'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "payment-template.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={downloadTemplate} 
          variant="outline"
          className="bg-[#90BE6D] text-[#1B4332] hover:bg-[#70A349]"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
        <div className="relative">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
            disabled={uploading}
          />
          <Button 
            asChild 
            disabled={uploading}
            className="bg-[#90BE6D] text-[#1B4332] hover:bg-[#70A349]"
          >
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Payment Data"}
            </label>
          </Button>
        </div>
      </div>

      {showPaymentForm && selectedInvoice && (
        <PaymentForm
          isOpen={showPaymentForm}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowPaymentForm(false);
            setSelectedInvoice(null);
            toast({
              title: "Success",
              description: "Payment recorded successfully",
            });
          }}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}