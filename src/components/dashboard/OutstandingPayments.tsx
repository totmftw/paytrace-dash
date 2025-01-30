import { Card } from "@/components/ui/card";

export function OutstandingPayments() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Outstanding Payments</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Invoice #{i}</p>
            <p className="text-sm text-muted-foreground">Due: $500</p>
          </div>
        ))}
      </div>
    </div>
  );
}