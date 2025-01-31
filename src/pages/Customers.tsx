import { useInvoiceData } from "@/hooks/useInvoiceData";
import { AddInvoiceButton } from "@/components/buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "@/components/buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "@/components/buttons/UploadInvoiceButton";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { useFinancialYear } from "@/hooks/useFinancialYear";

export default function Customers() {
  const { currentYear } = useFinancialYear();
  const { data: invoices, isLoading, isError } = useInvoiceData(currentYear);

  if (isError) return <div>Error fetching data</div>;

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