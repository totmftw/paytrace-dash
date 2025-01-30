import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnConfigProvider } from "@/contexts/columnConfigContext";
import CustomerTable from "@/components/customers/CustomerTable";
import CustomerBalanceTable from "@/components/customers/CustomerBalanceTable";

export default function Customers() {
  const navigate = useNavigate();
  const { selectedYear } = useFinancialYear();

  return (
    <div className="space-y-6 bg-[#E8F3E8] min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1B4D3E]">Customers</h2>
          <p className="text-[#4A7862]">
            View and manage all customers
          </p>
        </div>
        <FinancialYearSelector />
      </div>

      <ColumnConfigProvider>
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="balances">Customer Balances</TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            <CustomerTable />
          </TabsContent>
          <TabsContent value="balances">
            <CustomerBalanceTable />
          </TabsContent>
        </Tabs>
      </ColumnConfigProvider>
    </div>
  );
}