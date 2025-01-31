import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentHistorySection } from "./PaymentHistorySection";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";

export function PaymentTabs() {
  return (
    <Tabs defaultValue="payments" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-black">Payments</h2>
        <div className="flex items-center gap-4">
          <ExcelUpload />
          <TabsList>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="payments" className="space-y-6">
        <PaymentHistorySection />
      </TabsContent>
    </Tabs>
  );
}