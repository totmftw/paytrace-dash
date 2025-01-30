import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionInvoiceTable } from "@/components/transactions/TransactionInvoiceTable";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";
import { PaymentTabs } from "@/components/payments/PaymentTabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerLedgerDialog } from "@/components/transactions/CustomerLedgerDialog";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

interface CustomerData {
  id: number;
  name: string;
  whatsappNumber: number;
}

export default function Transactions() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const { selectedYear, setSelectedYear, fyOptions } = useFinancialYear();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customerMaster')
        .select('id, custBusinessname, custWhatsapp')
        .order('custBusinessname');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ['customer-ledger', selectedCustomer?.id, selectedYear],
    queryFn: async () => {
      if (!selectedCustomer) return null;
      
      const { data, error } = await supabase
        .from('customer_ledger_view')
        .select('*')
        .eq('custId', selectedCustomer.id)
        .eq('financial_year', selectedYear)
        .order('createdAt');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer && !!selectedYear
  });

  const customerOptions = customers?.map(c => ({
    label: c.custBusinessname,
    value: c.id.toString(),
    data: {
      id: c.id,
      name: c.custBusinessname,
      whatsappNumber: c.custWhatsapp
    }
  })) || [];

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      
      <Tabs defaultValue="ledger" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ledger">Customer Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="w-96">
              <Combobox
                items={customerOptions}
                placeholder="Search customer..."
                onSelect={(value) => {
                  const customer = customerOptions.find(c => c.value === value);
                  if (customer) {
                    setSelectedCustomer(customer.data);
                  }
                }}
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {fyOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    FY {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCustomer && ledgerData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{selectedCustomer.name} - Ledger</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Debit</th>
                      <th className="text-right p-2">Credit</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.map((entry) => (
                      <tr key={entry.ledgerId} className="border-b">
                        <td className="p-2">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">{entry.description}</td>
                        <td className="text-right p-2">
                          {entry.transactionType === 'invoice' || entry.transactionType === 'debit_note' 
                            ? entry.amount.toFixed(2) 
                            : '-'}
                        </td>
                        <td className="text-right p-2">
                          {entry.transactionType === 'payment' || entry.transactionType === 'credit_note' 
                            ? entry.amount.toFixed(2) 
                            : '-'}
                        </td>
                        <td className="text-right p-2">{entry.runningBalance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <TransactionInvoiceTable 
            data={[]} 
            onCustomerClick={() => {}} 
            onInvoiceClick={() => {}}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
}