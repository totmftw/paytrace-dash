import { InvoiceUploadButtons } from "@/components/invoices-payments/InvoiceUploadButtons";
import EnhancedInvoiceTable from "@/components/invoices-payments/EnhancedInvoiceTable";

export default function InvoicesAndPayments() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices and Payments</h1>
        <InvoiceUploadButtons />
      </div>
      <EnhancedInvoiceTable invoices={[]} />
    </div>
  );
}