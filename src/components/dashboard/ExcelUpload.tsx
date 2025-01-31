import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { PaymentForm } from "@/components/invoices/PaymentForm";

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const errors: string[] = [];
    const processed: string[] = [];

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRowData[];

        for (const row of jsonData) {
          try {
            // First, verify the invoice exists and get its ID
            const { data: invoices, error: invoiceError } = await supabase
              .from('invoiceTable')
              .select('invId, invTotal, invBalanceAmount, invCustid')
              .eq('invNumber', row.InvoiceNumber)
              .maybeSingle(); // Changed from single() to maybeSingle()

            if (invoiceError || !invoices) {
              errors.push(`Invoice ${row.InvoiceNumber} not found`);
              continue; // Skip to next row instead of throwing error
            }

            const paymentAmount = Number(row.Amount);
            const balanceAmount = invoices.invBalanceAmount || invoices.invTotal;
            const paymentDifference = balanceAmount - paymentAmount;

            // Insert payment record
            const { error: paymentError } = await supabase
              .from("paymentTransactions")
              .insert({
                invId: invoices.invId,
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
              .from("invoiceTable")
              .update({
                invBalanceAmount: paymentDifference,
                invPaymentDifference: paymentDifference,
                invPaymentStatus: paymentDifference <= 0 ? 'paid' : 
                                paymentDifference < balanceAmount ? 'partial' : 'pending',
                invMarkcleared: paymentDifference <= 0,
              })
              .eq("invId", invoices.invId);

            if (invoiceUpdateError) {
              errors.push(`Failed to update invoice ${row.InvoiceNumber}: ${invoiceUpdateError.message}`);
              continue;
            }

            // Create ledger entry
            const { error: ledgerError } = await supabase
              .from("paymentLedger")
              .insert({
                invId: invoices.invId,
                custId: invoices.invCustid,
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

        // Show summary toast
        if (processed.length > 0) {
          toast({
            title: "Upload Complete",
            description: `Successfully processed ${processed.length} payments${errors.length > 0 ? '. Some errors occurred.' : ''}`,
          });
        }

        // If there were any errors, show them in a separate toast
        if (errors.length > 0) {
          toast({
            variant: "destructive",
            title: "Some payments failed to process",
            description: `${errors.length} error(s) occurred. Check the console for details.`,
          });
          console.error('Payment upload errors:', errors);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload payment data",
      });
    } finally {
      setUploading(false);
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

  const handleAddSinglePayment = async () => {
    try {
      // Get the latest unpaid invoice for demonstration
      const { data: invoice, error } = await supabase
        .from('invoiceTable')
        .select('invId, invTotal, invBalanceAmount, invCustid')
        .eq('invPaymentStatus', 'pending')
        .order('invDate', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      setSelectedInvoice(invoice);
      setShowPaymentForm(true);
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch invoice information. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={downloadTemplate} variant="outline">
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
          <Button asChild disabled={uploading}>
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Payment Data"}
            </label>
          </Button>
        </div>
        <Button onClick={handleAddSinglePayment}>
          Add Single Payment
        </Button>
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