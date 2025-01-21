import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentMetric {
  title: string;
  amount: number;
  status: "warning" | "danger" | "success";
  count: number;
}

const metrics: PaymentMetric[] = [
  {
    title: "Pending Payments",
    amount: 125000,
    status: "warning",
    count: 23,
  },
  {
    title: "Overdue Payments",
    amount: 45000,
    status: "danger",
    count: 8,
  },
];

export function PaymentMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <AlertCircle
              className={`h-4 w-4 ${
                metric.status === "warning"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metric.amount)}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {metric.count} invoices
              </p>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}