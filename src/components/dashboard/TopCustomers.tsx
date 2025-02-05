import { Card } from "@/components/ui/card";

export function TopCustomers() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Top Customers</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Customer #{i}</p>
            <p className="text-sm text-muted-foreground">Total Spent: $10,000</p>
          </div>
        ))}
      </div>
    </div>
  );
}