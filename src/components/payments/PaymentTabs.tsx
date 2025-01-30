import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentHistorySection } from "./PaymentHistorySection";
import { PaymentUploadSection } from "./PaymentUploadSection";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";

export function PaymentTabs() {
  return (
    <Tabs defaultValue="history" className="space-y-4">
      <TabsList>
        <TabsTrigger value="history">Payment History</TabsTrigger>
        <TabsTrigger value="upload">Upload Payments</TabsTrigger>
      </TabsList>
      <TabsContent value="history">
        <PaymentHistorySection />
      </TabsContent>
      <TabsContent value="upload">
        <PaymentUploadSection />
        <ExcelUpload uploadType="payment" />
      </TabsContent>
    </Tabs>
  );
}