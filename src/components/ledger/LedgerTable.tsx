
import { DataTable } from "@/components/ui/datatable";
import type { CustomerMaster } from "@/types";

interface LedgerTableProps {
  data: CustomerMaster[];
}

export const LedgerTable = ({ data }: LedgerTableProps) => {
  return (
    <DataTable
      data={data}
      columns={[
        {
          key: "custBusinessname",
          header: "Business Name"
        },
        {
          key: "custWhatsapp",
          header: "WhatsApp"
        }
      ]}
    />
  );
};

