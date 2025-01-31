import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function IncomeVsExpenses() {
  const { selectedYear } = useFinancialYear();

  const { data: financialData } = useQuery({
    queryKey: ["financial-data", selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-04-01`;
      const endDate = `${+selectedYear + 1}-03-31`;

      const { data: invoices } = await supabase
        .from("invoiceTable")
        .select("invTotal, invDate")
        .gte("invDate", startDate)
        .lte("invDate", endDate);

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, date")
        .gte("date", startDate)
        .lte("date", endDate);

      return {
        invoices,
        expenses,
      };
    },
  });

  if (!financialData) return null;

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    income: 0,
    expenses: 0,
  }));

  financialData.invoices?.forEach((invoice) => {
    const month = new Date(invoice.invDate).getMonth();
    monthlyData[month].income += Number(invoice.invTotal);
  });

  financialData.expenses?.forEach((expense) => {
    const month = new Date(expense.date).getMonth();
    monthlyData[month].expenses += Number(expense.amount);
  });

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString()}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Area
            type="monotone"
            dataKey="income"
            fill="#22c55e"
            stroke="#22c55e"
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            fill="#eab308"
            stroke="#eab308"
            name="Expenses"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}