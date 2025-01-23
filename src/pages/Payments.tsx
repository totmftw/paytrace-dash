import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentLedgerDialog } from "@/components/payments/PaymentLedgerDialog";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
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

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paymentTransactions")
        .select(`
          *,
          invoiceTable (
            invNumber,
            invTotal,
            customerMaster (
              id,
              custBusinessname,
              custWhatsapp
            )
          )
        `)
        .order('paymentDate', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching payments",
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

  if (isLoadingBalances || isLoadingPayments) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline">
            Upload Payments
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
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

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment) => (
                    <TableRow key={payment.paymentId}>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {payment.invoiceTable?.invNumber?.join("-")}
                      </TableCell>
                      <TableCell>
                        {payment.invoiceTable?.customerMaster?.custBusinessname}
                      </TableCell>
                      <TableCell>{payment.transactionId}</TableCell>
                      <TableCell>{payment.paymentMode}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

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