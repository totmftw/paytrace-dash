import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { InvoicePaymentTable } from "@/components/invoices-payments/InvoicePaymentTable";
import { CustomerBalancesCard } from "@/components/payments/CustomerBalancesCard";
import { PaymentHistoryCard } from "@/components/payments/PaymentHistoryCard";
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
    // Handle customer click - you can navigate to customer details or show a modal
    console.log('Customer clicked:', customer);
  };

  const handleInvoiceClick = (invoice: any) => {
    // Handle invoice click - you can navigate to invoice details or show a modal
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
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          <InvoicePaymentTable 
            data={invoicePayments || []}
            onCustomerClick={handleCustomerClick}
            onInvoiceClick={handleInvoiceClick}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6">
            <CustomerBalancesCard />
            <PaymentHistoryCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}