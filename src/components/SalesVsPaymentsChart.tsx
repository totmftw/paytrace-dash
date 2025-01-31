import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesVsPaymentsChartProps {
  selectedYear: string;
}

export function SalesVsPaymentsChart({ selectedYear }: SalesVsPaymentsChartProps) {
  const [startDate, endDate] = selectedYear.split('-');
  const fyStartDate = `${startDate}-04-01`;
  const fyEndDate = `${endDate}-03-31`;

  const { data: chartData } = useQuery({
    queryKey: ["sales-vs-payments", selectedYear],
    queryFn: async () => {
      const { data: invoices, error: invError } = await supabase
        .from("invoiceTable")
        .select(`
          invTotal,
          invDate,
          paymentTransactions (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", fyStartDate)
        .lte("invDate", fyEndDate);

      if (invError) throw invError;

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
        sales: 0,
        payments: 0,
      }));

      invoices?.forEach((invoice) => {
        const month = new Date(invoice.invDate).getMonth();
        monthlyData[month].sales += invoice.invTotal;

        const payments = invoice.paymentTransactions?.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ) || 0;
        monthlyData[month].payments += payments;
      });

      return monthlyData;
    },
  });

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 px-4">Sales vs Payments</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#22c55e" name="Sales" />
            <Bar dataKey="payments" fill="#3b82f6" name="Payments Received" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}