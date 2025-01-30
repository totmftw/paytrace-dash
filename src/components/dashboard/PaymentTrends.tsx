import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', payments: 4000 },
  { month: 'Feb', payments: 3000 },
  { month: 'Mar', payments: 2000 },
  { month: 'Apr', payments: 2780 },
  { month: 'May', payments: 1890 },
  { month: 'Jun', payments: 2390 },
];

export function PaymentTrends() {
  return (
    <div className="h-full w-full">
      <h3 className="text-lg font-semibold mb-4">Payment Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="payments" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}