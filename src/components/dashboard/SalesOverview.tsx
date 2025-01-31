import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export function SalesOverview() {
  const { selectedYear } = useFinancialYear();
  const { start, end } = getFYDates(selectedYear);

  const { data } = useQuery({
    queryKey: ["sales-overview", selectedYear],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select("invTotal, invDate")
        .gte("invDate", start.toISOString())
        .lte("invDate", end.toISOString());

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

  function getFYDates(year: string) {
    const [startYear] = year.split('-').map(Number);
    const start = new Date(startYear, 3, 1); // April 1st
    const end = new Date(startYear + 1, 2, 31); // March 31st next year
    return { start, end };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yearly Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="sales" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}