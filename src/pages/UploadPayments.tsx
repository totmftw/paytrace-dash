import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentLedgerDialog } from "@/components/payments/PaymentLedgerDialog";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function UploadPayments() {
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    whatsapp: number;
  } | null>(null);
  const { toast } = useToast();

  const { data: ledgerBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ["ledger-balances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_ledger_balance')
        .select('*')
        .order('custBusinessname');

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching balances",
          description: error.message
        });
        throw error;
      }
      return data;
    },
  });

  const downloadTemplate = () => {
    const template = [
      {
        InvoiceId: '1',
        TransactionId: 'TXN123',
        PaymentMode: 'bank_transfer',
        PaymentDate: '2024-01-21',
        Amount: '1000',
        Remarks: 'Payment for Invoice #1',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    ws['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
    ];

    XLSX.writeFile(wb, "payment-upload-template.xlsx");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process each payment record
        for (const record of jsonData as any[]) {
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoiceTable')
            .select('invTotal, invBalanceAmount')
            .eq('invId', record.InvoiceId)
            .single();

          if (invoiceError) {
            toast({
              variant: "destructive",
              title: `Error fetching invoice #${record.InvoiceId}`,
              description: invoiceError.message
            });
            continue;
          }

          const paymentAmount = Number(record.Amount);
          const balanceAmount = Number(invoice.invBalanceAmount || invoice.invTotal);
          const difference = balanceAmount - paymentAmount;

          // Insert payment transaction
          const { error: paymentError } = await supabase
            .from('paymentTransactions')
            .insert({
              invId: record.InvoiceId,
              transactionId: record.TransactionId,
              paymentMode: record.PaymentMode,
              paymentDate: record.PaymentDate,
              amount: paymentAmount,
              remarks: record.Remarks
            });

          if (paymentError) {
            toast({
              variant: "destructive",
              title: "Error recording payment",
              description: paymentError.message
            });
            continue;
          }

          // Update invoice balance
          const { error: updateError } = await supabase
            .from('invoiceTable')
            .update({
              invBalanceAmount: difference,
              invPaymentDifference: difference,
              invPaymentStatus: difference === 0 ? 'paid' : 'partial'
            })
            .eq('invId', record.InvoiceId);

          if (updateError) {
            toast({
              variant: "destructive",
              title: "Error updating invoice",
              description: updateError.message
            });
            continue;
          }
        }

        toast({
          title: "Success",
          description: "Payments uploaded successfully"
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading payments",
        description: error.message
      });
    }
  };

  if (isLoadingBalances) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Upload Payments</h2>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="payment-file"
            />
            <Button variant="outline" onClick={() => document.getElementById('payment-file')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Payments
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerBalances?.map((balance) => (
                  <TableRow key={balance.custId}>
                    <TableCell>{balance.custBusinessname}</TableCell>
                    <TableCell>{formatCurrency(balance.balance)}</TableCell>
                    <TableCell>
                      {balance.last_transaction_date
                        ? new Date(balance.last_transaction_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCustomer({
                          id: balance.custId,
                          name: balance.custBusinessname,
                          whatsapp: balance.custWhatsapp
                        })}
                      >
                        View Ledger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <PaymentLedgerDialog
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          whatsappNumber={selectedCustomer.whatsapp}
        />
      )}
    </div>
  );
}