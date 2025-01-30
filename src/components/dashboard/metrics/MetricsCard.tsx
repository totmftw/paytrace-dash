import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  amount?: number;
  count: number;
  status?: "warning" | "danger";
  onViewDetails: () => void;
}

export function MetricsCard({ title, amount, count, status, onViewDetails }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-black">
          {title}
        </CardTitle>
        {status && (
          <AlertCircle
            className={`h-4 w-4 ${
              status === "warning"
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-black">
          {title === "Orders" ? count : formatCurrency(amount || 0)}
        </div>
        <div className="flex items-center justify-between">
          {title !== "Orders" && (
            <p className="text-xs text-muted-foreground">
              {count} invoices
            </p>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={onViewDetails}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}