import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export function SalesOverview() {
  const { selectedYear, startDate, endDate } = useFinancialYear();

  const { data } = useQuery({
    queryKey: ["sales-overview", selectedYear],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select("invTotal, invDate")
        .gte("invDate", startDate.toISOString())
        .lte("invDate", endDate.toISOString());

      if (error) throw error;

      const monthlySales = Array(12).fill(0);
      invoices?.forEach((invoice) => {
        const month = new Date(invoice.invDate).getMonth();
        monthlySales[month] += invoice.invTotal;
      });

      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        sales: monthlySales[i],
      }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yearly Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="sales" fill="#22c55e" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}