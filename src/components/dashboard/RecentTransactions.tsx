import { Card } from "@/components/ui/card";

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Transactions</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Transaction #{i}</p>
            <p className="text-sm text-muted-foreground">Amount: $1,000</p>
          </div>
        ))}
      </div>
    </div>
  );
}