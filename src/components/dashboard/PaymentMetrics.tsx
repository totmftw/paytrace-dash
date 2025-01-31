import { useState } from "react";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";

interface MetricsData {
  pendingAmount: number;
  outstandingAmount: number;
  totalSales: number;
  totalOrders: number;
  pendingInvoices: any[];
  outstandingInvoices: any[];
  allInvoices: any[];
}

export function PaymentMetrics() {
  const { selectedYear } = useFinancialYear();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");

  const { data } = useQuery<MetricsData>({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod
          ),
          paymentTransactions:paymentTransactions (
            amount
          )
        `)
        .gte("invDate", selectedYear.split('-')[0] + "-04-01")
        .lte("invDate", selectedYear.split('-')[1] + "-03-31");

      if (error) throw error;

      const today = new Date();
      const pendingInvoices = invoices.filter(
        (inv) => new Date(inv.invDuedate) > today
      );
      const outstandingInvoices = invoices.filter(
        (inv) => new Date(inv.invDuedate) < today
      );

      return {
        pendingAmount: pendingInvoices.reduce((sum, inv) => sum + inv.invTotal, 0),
        outstandingAmount: outstandingInvoices.reduce((sum, inv) => sum + inv.invTotal, 0),
        totalSales: invoices.reduce((sum, inv) => sum + inv.invTotal, 0),
        totalOrders: invoices.length,
        pendingInvoices,
        outstandingInvoices,
        allInvoices: invoices,
      };
    },
  });

  const handleMetricClick = (type: string) => {
    if (!data) return;

    switch (type) {
      case "pending":
        setSelectedData(data.pendingInvoices);
        setDialogTitle("Pending Payments");
        break;
      case "outstanding":
        setSelectedData(data.outstandingInvoices);
        setDialogTitle("Outstanding Payments");
        break;
      case "sales":
        setSelectedData(data.allInvoices);
        setDialogTitle("Total Sales");
        break;
      case "orders":
        setSelectedData(data.allInvoices);
        setDialogTitle("Total Orders");
        break;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer" onClick={() => handleMetricClick("pending")}>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.pendingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => handleMetricClick("outstanding")}>
          <CardHeader>
            <CardTitle>Outstanding Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.outstandingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => handleMetricClick("sales")}>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.totalSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => handleMetricClick("orders")}>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={selectedData.length > 0} onOpenChange={() => setSelectedData([])}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.map((invoice) => (
                  <tr key={invoice.invId}>
                    <td>{invoice.invNumber}</td>
                    <td>{invoice.customerMaster.custBusinessname}</td>
                    <td>₹{invoice.invTotal.toLocaleString()}</td>
                    <td>{new Date(invoice.invDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
