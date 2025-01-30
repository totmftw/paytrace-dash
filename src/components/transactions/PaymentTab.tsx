import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useToast } from "@/components/ui/use-toast";
import { ColumnConfigProvider } from "@/contexts/columnConfigContext";

export default function PaymentTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const { toast } = useToast();
  const { start, end } = getFYDates();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paymentTransactions')
        .select('*')
        .gte('paymentDate', start.toISOString())
        .lte('paymentDate', end.toISOString());

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching payments",
          description: error.message
        });
        throw error;
      }
      return data || [];
    }
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load payments. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ColumnConfigProvider>
        <TransactionInvoiceTable 
          data={payments || []}
          onCustomerClick={(customer) => {
            // Handle customer click
          }}
          onInvoiceClick={(invoice) => {
            // Handle invoice click
          }}
          isLoading={isLoading}
        />
      </ColumnConfigProvider>
    </div>
  );
}