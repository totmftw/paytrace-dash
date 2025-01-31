import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { PaymentUploadSection } from "@/components/payments/PaymentUploadSection";
import { PaymentHistorySection } from "@/components/payments/PaymentHistorySection";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";

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
    <div className="space-y-6 bg-[#E8F3E8] min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1B4D3E]">Transactions</h2>
          <p className="text-[#4A7862]">
            View and manage all transactions
          </p>
        </div>
        <FinancialYearSelector />
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="bg-[#90BE6D]">
          <TabsTrigger value="invoices" className="text-[#1B4D3E] data-[state=active]:bg-[#E8F3E8]">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-[#1B4D3E] data-[state=active]:bg-[#E8F3E8]">
            Payments
          </TabsTrigger>
          <TabsTrigger value="ledger" className="text-[#1B4D3E] data-[state=active]:bg-[#E8F3E8]">
            Customer Ledger
          </TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="space-y-4">
          <TransactionInvoiceTable 
            data={invoices || []}
            onCustomerClick={handleCustomerClick}
            onInvoiceClick={handleInvoiceClick}
          />
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Card className="p-6 bg-[#E8F3E8]">
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