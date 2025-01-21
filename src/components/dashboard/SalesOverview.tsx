import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SalesData {
  month: string;
  sales: number;
  pending: number;
  overdue: number;
}

const data: SalesData[] = [
  { month: "Jan", sales: 45000, pending: 12000, overdue: 4500 },
  { month: "Feb", sales: 52000, pending: 15000, overdue: 3800 },
  { month: "Mar", sales: 48000, pending: 10000, overdue: 5200 },
];

export function SalesOverview() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              sales: { color: "#22c55e" },
              pending: { color: "#eab308" },
              overdue: { color: "#ef4444" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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