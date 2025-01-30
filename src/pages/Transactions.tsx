import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { PaymentUploadSection } from "@/components/payments/PaymentUploadSection";
import { PaymentHistorySection } from "@/components/payments/PaymentHistorySection";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Transactions() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster:invCustid(
            custBusinessname,
            custWhatsapp
          )
        `);
      if (error) throw error;
      return data;
    }
  });

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

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
          <TransactionInvoiceTable 
            data={invoices || []}
            onCustomerClick={handleCustomerClick}
            onInvoiceClick={handleInvoiceClick}
          />
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Card className="p-6">
            <PaymentUploadSection />
            <PaymentHistorySection />
          </Card>
        </TabsContent>
        <TabsContent value="ledger" className="space-y-4">
          <CustomerLedgerTable onCustomerClick={handleCustomerClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}