import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCardProps } from "@/types/dashboard";

export function MetricsCard({ title, value, icon }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR'
          }) : value}
        </div>
      </CardContent>
    </Card>
  );
}