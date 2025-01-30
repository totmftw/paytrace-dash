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

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('invoiceTable')
          .select('*')
          .gte('invDate', start.toISOString())
          .lte('invDate', end.toISOString());

        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching invoices",
            description: error.message
          });
          throw error;
        }
        return data || [];
      } catch (err) {
        console.error('Error fetching invoices:', err);
        toast({
          variant: "destructive",
          title: "Error fetching invoices",
          description: "Please try again later"
        });
        return [];
      }
    }
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load invoices. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ColumnConfigProvider>
        <TransactionInvoiceTable 
          data={invoices || []}
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