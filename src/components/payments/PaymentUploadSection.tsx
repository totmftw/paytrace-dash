import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";

export function PaymentUploadSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Upload Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <ExcelUpload />
      </CardContent>
    </Card>
  );
}