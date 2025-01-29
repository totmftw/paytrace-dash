import { Card } from "@/components/ui/card";
import { CustomerBalancesCard } from "./CustomerBalancesCard";
import { PaymentHistoryCard } from "./PaymentHistoryCard";

export function PaymentHistorySection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CustomerBalancesCard />
      <PaymentHistoryCard />
    </div>
  );
}