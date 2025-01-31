// src/pages/Transactions/InvoiceTab.tsx
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { AddInvoiceButton } from '@/components/buttons/AddInvoiceButton';
import { DownloadTemplateButton } from '@/components/buttons/DownloadTemplateButton';
import { InvoiceTable } from '@/components/transactions/InvoiceTable';
import { useColumnConfig } from '@/contexts/ColumnConfigContext';

export default function InvoiceTab({ year }: { year: string }) {
  const { data: invoices, isLoading, isError } = useInvoiceData(year);
  const { visibleColumns } = useColumnConfig();

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
      <InvoiceTable data={invoices} isLoading={isLoading} visibleColumns={visibleColumns} />
    </div>
  );
}