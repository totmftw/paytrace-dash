import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ExcelUpload />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Sale Entry
          </Button>
        </div>
      </div>

      <PaymentMetrics />
      
      <div className="grid gap-4 md:grid-cols-3">
        <SalesOverview />
      </div>
    </div>
  );
};

export default Dashboard;