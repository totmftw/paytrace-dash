import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { NewSaleForm } from "@/components/dashboard/NewSaleForm";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ExcelUpload />
          <NewSaleForm />
        </div>
      </div>

      <PaymentMetrics />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <SalesOverview />
        </div>
      </div>

      <PaymentTracking />
    </div>
  );
};

export default Dashboard;