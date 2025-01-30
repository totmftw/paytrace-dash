import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { PaymentUploadSection } from "@/components/payments/PaymentUploadSection";
import { PaymentHistorySection } from "@/components/payments/PaymentHistorySection";
import { Card } from "@/components/ui/card";

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View and manage all transactions
        </p>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ledger">Customer Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="space-y-4">
          <TransactionInvoiceTable />
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Card className="p-6">
            <PaymentUploadSection />
            <PaymentHistorySection />
          </Card>
        </TabsContent>
        <TabsContent value="ledger" className="space-y-4">
          <CustomerLedgerTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}