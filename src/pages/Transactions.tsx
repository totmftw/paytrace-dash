import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { PaymentTabs } from "@/components/payments/PaymentTabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerLedgerDialog } from "@/components/transactions/CustomerLedgerDialog";

interface CustomerData {
  id: number;
  name: string;
  whatsappNumber: number;
}

export default function Transactions() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  const { data: invoicePayments, isLoading } = useQuery({
    queryKey: ['invoice-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          invId,
          invNumber,
          invDate,
          invDuedate,
          invTotal,
          customerMaster (
            id,
            custBusinessname,
            custWhatsapp
          )
        `)
        .order('invDate', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCustomerClick = (customer: CustomerData) => {
    setSelectedCustomer(customer);
  };

  const handleInvoiceClick = (invoice: any) => {
    console.log('Invoice clicked:', invoice);
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ledger">Customer Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          <TransactionInvoiceTable 
            data={invoicePayments || []}
            onCustomerClick={handleCustomerClick}
            onInvoiceClick={handleInvoiceClick}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentTabs />
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
          <CustomerLedgerTable onCustomerClick={handleCustomerClick} />
        </TabsContent>
      </Tabs>

      {selectedCustomer && (
        <CustomerLedgerDialog
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}