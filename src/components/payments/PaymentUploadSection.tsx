import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";

export function PaymentUploadSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ExcelUpload uploadType="payment" />
        </div>
      </CardContent>
    </Card>
  );
}