import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: number;
  isMonetary?: boolean;
  onClick: () => void;
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