
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";

export default function PaymentTab({ year }: { year: string }) {
  const { data: invoices, isLoading, error } = useInvoiceData(year);

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AddInvoiceButton />
        <div className="flex items-center gap-4">
          <DownloadTemplateButton tableName="invoiceTable" />
          <UploadInvoiceButton />
        </div>
      </div>
      <TransactionInvoiceTable
        data={invoices || []}
        isLoading={isLoading}
        onCustomerClick={() => {}}
        onInvoiceClick={() => {}}
      />
    </div>
  );
}
