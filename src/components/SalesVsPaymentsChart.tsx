import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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