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
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Payments() {
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    whatsapp: number;
  } | null>(null);

  const { data: ledgerBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ["ledger-balances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_ledger_balance')
        .select('*')
        .order('custBusinessname');

      if (error) throw error;
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

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingBalances || isLoadingPayments) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <Tabs defaultValue="payments" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <TabsList>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="upload">Upload Payments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
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
                <ScrollArea className="h-[300px] w-full">
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
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <ExcelUpload />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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