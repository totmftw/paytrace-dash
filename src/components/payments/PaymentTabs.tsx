import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentHistorySection } from "./PaymentHistorySection";
import { PaymentUploadSection } from "./PaymentUploadSection";

export function PaymentTabs() {
  return (
    <Tabs defaultValue="payments" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-black">Payments</h2>
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="upload">Upload Payments</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="payments" className="space-y-6">
        <PaymentHistorySection />
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <PaymentUploadSection />
      </TabsContent>
    </Tabs>
  );
}