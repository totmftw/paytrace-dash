import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { PaymentTabs } from "@/components/payments/PaymentTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  id: number;
  name: string;
  whatsappNumber: number;
}

export default function Transactions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: invoicePayments } = useQuery({
    queryKey: ['invoice-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleCustomerClick = (customer: CustomerData) => {
    console.log('Customer clicked:', customer);
  };

  const handleInvoiceClick = (invoice: any) => {
    console.log('Invoice clicked:', invoice);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
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
          <CustomerLedgerTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}