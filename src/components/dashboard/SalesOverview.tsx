import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SalesOverview() {
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());

  const getFinancialYearStart = (year: number) => new Date(`${year}-04-01`).toISOString();
  const getFinancialYearEnd = (year: number) => new Date(`${year + 1}-03-31`).toISOString();

  const { data: salesData } = useQuery({
    queryKey: ["sales-overview", financialYear],
    queryFn: async () => {
      const startDate = getFinancialYearStart(financialYear);
      const endDate = getFinancialYearEnd(financialYear);

      const { data: invoices, error } = await supabase
        .from("invoiceTable")
        .select("*")
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      if (error) throw error;

      const monthlyData = {};

      invoices?.forEach(invoice => {
        const date = new Date(invoice.invDate);
        const monthKey = date.toLocaleString('default', { month: 'short' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            sales: 0,
            pending: 0,
            overdue: 0
          };
        }

        const amount = Number(invoice.invTotal);
        const dueDate = new Date(invoice.invDuedate);
        const today = new Date();

        if (invoice.invMarkcleared) {
          monthlyData[monthKey].sales += amount;
        } else if (dueDate < today) {
          monthlyData[monthKey].overdue += amount;
        } else {
          monthlyData[monthKey].pending += amount;
        }
      });

      return Object.values(monthlyData);
    },
    refetchInterval: 300000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <Select
          value={financialYear.toString()}
          onValueChange={(value) => setFinancialYear(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Financial Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}-{year + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="w-full h-full">
          <ChartContainer
            config={{
              sales: { color: "#22c55e" },
              pending: { color: "#eab308" },
              overdue: { color: "#ef4444" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData || []}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Sales
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formatCurrency(payload[0]?.value as number)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Pending
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formatCurrency(payload[1]?.value as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }} />
                <Bar dataKey="sales" fill="var(--color-sales)" />
                <Bar dataKey="pending" fill="var(--color-pending)" />
                <Bar dataKey="overdue" fill="var(--color-overdue)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}