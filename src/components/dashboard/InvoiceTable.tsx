import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Invoice } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function InvoiceTable() {
  const { selectedYear } = useFinancialYear();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices } = useQuery({
    queryKey: ["invoices", selectedYear],
    queryFn: async () => {
      const [startDate, endDate] = selectedYear.split('-');
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          ),
          paymentTransactions (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", `${startDate}-04-01`)
        .lte("invDate", `${endDate}-03-31`);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((invoice) => (
                  <TableRow key={invoice.invId}>
                    <TableCell>
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {invoice.invNumber}
                      </button>
                    </TableCell>
                    <TableCell>{invoice.customerMaster.custBusinessname}</TableCell>
                    <TableCell>{new Date(invoice.invDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.invDuedate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.invTotal)}
                    </TableCell>
                    <TableCell>{invoice.invPaymentStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{selectedInvoice.invNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedInvoice.customerMaster.custBusinessname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.invDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.invDuedate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">
                    {formatCurrency(selectedInvoice.invTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance Amount</p>
                  <p className="font-medium">
                    {formatCurrency(selectedInvoice.invBalanceAmount)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Payment History</h4>
                {selectedInvoice.paymentTransactions?.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-t"
                  >
                    <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}