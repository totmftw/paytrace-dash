import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Transactions() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster:invCustid (
            id, custBusinessname, custWhatsapp
          )
        `)
        .gte('invDate', start.toISOString())
        .lte('invDate', end.toISOString());
  
      return data;
    }
  });

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
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CustomerLedgerTable 
              onCustomerClick={(customer) => navigate(`/customer/${customer.id}`)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}