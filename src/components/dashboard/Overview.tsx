import { Card } from "@/components/ui/card";
import { PaymentMetrics } from "./PaymentMetrics";
import { SalesOverview } from "./SalesOverview";
import { CustomerStats } from "./CustomerStats";
import { PaymentTracking } from "./PaymentTracking";
import { RecentSales } from "./RecentSales";
import { useLayouts } from "@/hooks/useLayouts";

const componentOrder = [
  PaymentMetrics,
  SalesOverview,
  CustomerStats,
  PaymentTracking,
  RecentSales,
];

export function Overview() {
  const { saveLayout } = useLayouts();

  return (
    <div className="grid-auto-fit">
      {componentOrder.map((Component, index) => (
        <Card
          key={index}
          horizontalScroll
          verticalScroll
          className="h-[400px] max-w-4xl"
          onResize={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            saveLayout({ id: Component.name, width: rect.width, height: rect.height });
          }}
        >
          <Component />
        </Card>
      ))}
    </div>
  );
}