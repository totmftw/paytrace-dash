import { useColumnConfig } from "@/contexts/ColumnConfigContext";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { AddInvoiceButton } from "../buttons/AddInvoiceButton";
import { DownloadTemplateButton } from "../buttons/DownloadTemplateButton";
import { UploadInvoiceButton } from "../buttons/UploadInvoiceButton";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import type { Invoice } from "@/types";

export default function InvoiceTab({ year }: { year: string }) {
  const { data: invoices, isLoading, isError } = useInvoiceData(year);

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
