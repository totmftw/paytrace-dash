
import { Card } from "@/components/ui/card";
import { CustomerList, useCustomers } from "../ledger/CustomerList";
import { LedgerTable } from "../ledger/LedgerTable";
import { LedgerExport } from "../ledger/LedgerExport";

export default function LedgerTab() {
  const { data: customers } = useCustomers();

  return (
    <Card className="p-4">
      <LedgerExport data={customers || []} />
      <LedgerTable data={customers || []} />
    </Card>
  );
}

