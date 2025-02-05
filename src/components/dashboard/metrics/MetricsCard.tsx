import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: number;
  isMonetary?: boolean;
  onClick?: () => void;
}

export function MetricsCard({ title, value, isMonetary = true, onClick }: MetricsCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isMonetary ? formatCurrency(value) : value}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCard title="Total Sales" value={0} />
      <MetricsCard title="Pending Payments" value={0} />
      <MetricsCard title="Outstanding Payments" value={0} />
      <MetricsCard title="Total Invoices" value={0} isMonetary={false} />
    </div>
  );
}