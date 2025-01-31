import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInvoiceData } from '@/hooks/useInvoiceApi';
import { getFinancialYearDates } from '@/utils/financialYear';
import { Invoice } from '@/types';

interface SalesVsPaymentsChartProps {
  selectedYear: string;
}

export function SalesVsPaymentsChart({ selectedYear }: SalesVsPaymentsChartProps) {
  const { start, end } = getFinancialYearDates(selectedYear);
  const { data: invoices } = useInvoiceData({ startDate: start.toISOString(), endDate: end.toISOString() });

  // Chart logic using invoices data

export function SalesVsPaymentsChart({ selectedYear }: { selectedYear: string }) {
  const [start, end] = selectedYear.split('-');
  const startDate = `${start}-04-01`;
  const endDate = `${end}-03-31`;

  const { data } = useQuery({
    queryKey: ['sales-vs-payments', selectedYear],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from('invoiceTable')
        .select('invTotal, invDate')
        .gte('invDate', startDate)
        .lte('invDate', endDate);

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        sales: 0,
        payments: 0,
      }));

      invoices?.forEach((invoice) => {
        const month = new Date(invoice.invDate).getMonth();
        monthlyData[month].sales += invoice.invTotal;
      });

      return monthlyData;
    },
  });
}
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 px-4">Sales vs Payments</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
export function SalesVsPaymentsChart() {
  const data = [
    { month: 'Jan', sales: 4000, payments: 3500 },
    { month: 'Feb', sales: 3000, payments: 2500 },
    { month: 'Mar', sales: 2000, payments: 1500 },
    { month: 'Apr', sales: 2780, payments: 2000 },
    { month: 'May', sales: 1890, payments: 1600 },
    { month: 'Jun', sales: 2390, payments: 2000 },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 px-4">Sales vs Payments</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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