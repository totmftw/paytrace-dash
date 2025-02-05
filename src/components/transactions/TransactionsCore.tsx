import { useNavigate } from "react-router-dom";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnConfigProvider } from "@/contexts/ColumnConfigContext";
import InvoiceTab from "./InvoiceTab";
import PaymentTab from "./PaymentTab";
import LedgerTab from "./LedgerTab";

export default function TransactionsCore() {
  const navigate = useNavigate();
  const { selectedYear } = useFinancialYear();

  return (
    <ColumnConfigProvider>
      <div className="space-y-6 bg-[#E8F3E8] min-h-screen p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1B4D3E]">Transactions</h2>
            <p className="text-[#4A7862]">
              View and manage all transactions
            </p>
          </div>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices">
            <InvoiceTab year={selectedYear} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentTab year={selectedYear} />
          </TabsContent>
          <TabsContent value="ledger">
            <LedgerTab />
          </TabsContent>
        </Tabs>
      </div>
    </ColumnConfigProvider>
  );
}