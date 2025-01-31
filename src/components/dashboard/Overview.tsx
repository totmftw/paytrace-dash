import { Card } from "@/components/ui/card";
import { PaymentMetrics } from "./PaymentMetrics";
import { SalesOverview } from "./SalesOverview";
import { CustomerStats } from "./CustomerStats";
import { PaymentTracking } from "./PaymentTracking";
import { RecentSales } from "./RecentSales";

export function Overview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-4">
        <PaymentMetrics />
      </Card>
      <Card className="col-span-4">
        <SalesOverview />
      </Card>
      <Card className="col-span-2">
        <CustomerStats />
      </Card>
      <Card className="col-span-2">
        <PaymentTracking />
      </Card>
      <Card className="col-span-4">
        <RecentSales />
      </Card>
    </div>
  );
}