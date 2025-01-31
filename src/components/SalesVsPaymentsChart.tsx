import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice } from "@/types";

interface ChartData {
  month: string;
  sales: number;
  payments: number;
}

export function SalesVsPaymentsChart({ selectedYear }: { selectedYear: string }) {
  const { data: invoices } = useQuery({
    queryKey: ["invoices", selectedYear],
    queryFn: async () => {
      const [startYear, endYear] = selectedYear.split('-');
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", `${startYear}-04-01`)
        .lte("invDate", `${endYear}-03-31`);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const chartData: ChartData[] = invoices
    ? Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2000, i, 1).toLocaleString('default', { month: 'short' });
        const monthInvoices = invoices.filter(inv => 
          new Date(inv.invDate).getMonth() === i
        );
        const sales = monthInvoices.reduce((sum, inv) => sum + inv.invTotal, 0);
        const payments = monthInvoices.reduce((sum, inv) => 
          sum + (inv.paymentTransactions?.reduce((pSum, p) => pSum + p.amount, 0) || 0), 
        0);
        return { month, sales, payments };
      })
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales vs Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart width={800} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" name="Sales" />
          <Bar dataKey="payments" fill="#82ca9d" name="Payments" />
        </BarChart>
      </CardContent>
    </Card>
  );
}