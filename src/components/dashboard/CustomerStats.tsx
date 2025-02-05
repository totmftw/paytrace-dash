import { Card } from "@/components/ui/card";

export function CustomerStats() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Statistics</h3>
      <div className="grid gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Active Customers</p>
          <p className="text-2xl font-bold">987</p>
        </div>
      </div>
    </div>
  );
}