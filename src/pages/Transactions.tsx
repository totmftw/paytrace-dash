import { useNavigate } from "react-router-dom";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import InvoiceTab from "@/components/transactions/InvoiceTab";
import PaymentTab from "@/components/transactions/PaymentTab";
import LedgerTab from "@/components/transactions/LedgerTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnConfigProvider } from "@/contexts/columnConfigContext";

export default function Transactions() {
  const navigate = useNavigate();
  const { selectedYear } = useFinancialYear();
  const isMobile = useIsMobile();

  return (
    <ColumnConfigProvider>
      <div className={`${isMobile ? "p-2" : "p-6"} space-y-6 bg-[#E8F3E8] min-h-screen`}>
        <div className="flex justify-between items-center flex-col md:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1B4D3E]">Transactions</h2>
            <p className="text-[#4A7862]">View and manage all transactions</p>
          </div>
          <FinancialYearSelector />
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
            <LedgerTab year={selectedYear} />
          </TabsContent>
        </Tabs>
      </div>
    </ColumnConfigProvider>
  );
}