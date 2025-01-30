// src/pages/Transactions.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceTab from "@/components/transactions/InvoiceTab";
import PaymentTab from "@/components/transactions/PaymentTab";
import LedgerTab from "@/components/transactions/LedgerTab";

export default function Transactions() {
  const navigate = useNavigate();
  const { selectedYear } = useFinancialYear();

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
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <InvoiceTab />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentTab />
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}