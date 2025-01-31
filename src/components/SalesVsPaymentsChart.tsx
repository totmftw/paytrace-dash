import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice } from "@/types/types";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export function SalesVsPaymentsChart() {
  const { selectedYear } = useFinancialYear();
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
          paymentTransactions (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", fyStartDate)
        .lte("invDate", fyEndDate);

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const chartData = invoices
    ? [...Array(12)].map((_, i) => {
        const monthName = new Date(0, i).toLocaleString("default", { month: "short" });
        const monthInvoices = invoices.filter((invoice) => 
          new Date(invoice.invDate).getMonth() === i
        );
        const sales = monthInvoices.reduce((sum, inv) => sum + inv.invTotal, 0);
        const payments = monthInvoices.reduce((sum, inv) => 
          sum + inv.paymentTransactions?.reduce((pSum, p) => pSum + p.amount, 0) ?? 0, 
          0
        );
        return { month: monthName, sales, payments };
      })
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales vs Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
            <Bar dataKey="sales" fill="#8884d8" name="Sales">
              <LabelList dataKey="sales" position="top" />
            </Bar>
            <Bar dataKey="payments" fill="#82ca9d" name="Payments">
              <LabelList dataKey="payments" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}