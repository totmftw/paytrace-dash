import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice, SalesVsPaymentsChartProps } from "@/types";

export function SalesVsPaymentsChart({ selectedYear }: SalesVsPaymentsChartProps) {
  const [startYear, endYear] = selectedYear.split('-');
  const fyStartDate = `${startYear}-04-01`;
  const fyEndDate = `${endYear}-03-31`;

  const { data: invoices } = useQuery({
    queryKey: ["sales-vs-payments", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", fyStartDate)
        .lte("invDate", fyEndDate);

      if (error) throw error;
      return data as unknown as Invoice[];
    },
  });

  const chartData = invoices
    ? Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2000, i).toLocaleString('default', { month: 'short' });
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
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" name="Sales" />
              <Bar dataKey="payments" fill="#82ca9d" name="Payments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}