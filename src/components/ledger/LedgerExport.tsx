
import { PDFExport } from "@/components/buttons/PDFExport";
import type { CustomerMaster } from "@/types";

interface LedgerExportProps {
  data: CustomerMaster[];
}

export const LedgerExport = ({ data }: LedgerExportProps) => {
  const exportData = data?.map(customer => ({
    name: customer.custBusinessname,
    whatsapp: customer.custWhatsapp,
    creditPeriod: customer.custCreditperiod
  })) || [];

  const handleExport = () => {
    // Export logic here
  };

  return (
    <PDFExport onClick={handleExport} fileName="customer-ledger.pdf">
      Export Customer Ledger
    </PDFExport>
  );
};

