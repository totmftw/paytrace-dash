import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { NewSaleForm } from "@/components/dashboard/NewSaleForm";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ExcelUpload />
          <NewSaleForm />
        </div>
      </div>

      <div className="grid gap-6">
        <PaymentMetrics />
        
        <div className="dashboard-card">
          <SalesOverview />
        </div>

        <div className="dashboard-card">
          <PaymentTracking />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;