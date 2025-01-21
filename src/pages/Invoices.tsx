import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Invoices = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Invoice tracking and payment management coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;