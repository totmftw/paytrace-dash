import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesVsPaymentsChartProps {
  selectedYear: string;
}

export function SalesVsPaymentsChart({ selectedYear }: SalesVsPaymentsChartProps) {
  const { data: invoices } = useQuery({
    queryKey: ["sales-vs-payments", selectedYear],
    queryFn: async () => {
      const [startYear, endYear] = selectedYear.split("-");
      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;

      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          invTotal,
          invDate,
          paymentTransactions (
            amount,
            paymentDate
          )
        `)
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      if (error) throw error;
      return data || [];
    },
  });

  const chartData = React.useMemo(() => {
    if (!invoices) return [];

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
      sales: 0,
      payments: 0
    }));

    invoices.forEach(invoice => {
      const month = new Date(invoice.invDate).getMonth();
      monthlyData[month].sales += invoice.invTotal;
      
      invoice.paymentTransactions?.forEach(payment => {
        const paymentMonth = new Date(payment.paymentDate).getMonth();
        monthlyData[paymentMonth].payments += payment.amount;
      });
    });

    return monthlyData;
  }, [invoices]);

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