import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid gap-6">
        <PaymentMetrics />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="dashboard-card col-span-1 md:col-span-2 lg:col-span-2">
            <SalesOverview />
          </Card>

          <Card className="dashboard-card">
            <div className="h-[300px]">
              {/* Additional chart component can be added here */}
            </div>
          </Card>

          <Card className="dashboard-card">
            <div className="h-[300px]">
              {/* Additional chart component can be added here */}
            </div>
          </Card>

          <Card className="dashboard-card">
            <div className="h-[300px]">
              {/* Additional chart component can be added here */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;