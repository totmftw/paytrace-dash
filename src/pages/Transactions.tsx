import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { InvoicePaymentTable } from "@/components/invoices-payments/InvoicePaymentTable";
import { CustomerBalancesCard } from "@/components/payments/CustomerBalancesCard";
import { PaymentHistoryCard } from "@/components/payments/PaymentHistoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Transactions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

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
          <InvoicePaymentTable />
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