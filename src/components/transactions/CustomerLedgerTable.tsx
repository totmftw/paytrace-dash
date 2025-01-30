import { useState } from "react";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

interface CustomerLedgerTableProps {
  onCustomerClick: (customer: { id: number; name: string; whatsappNumber: number }) => void;
}

export function CustomerLedgerTable({ onCustomerClick }: CustomerLedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customer-ledger", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_ledger_balance")
        .select(`
          custId,
          custBusinessname,
          custWhatsapp,
          balance,
          last_transaction_date
        `)
        .gte('last_transaction_date', start.toISOString())
        .lte('last_transaction_date', end.toISOString());

      if (error) throw error;
      return data;
    },
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.custBusinessname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <FinancialYearSelector />
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th className="text-right">Outstanding Amount</th>
              <th>Last Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  Loading customers...
                </td>
              </tr>
            ) : filteredCustomers?.length ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.custId}>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => onCustomerClick({
                        id: customer.custId,
                        name: customer.custBusinessname,
                        whatsappNumber: customer.custWhatsapp
                      })}
                    >
                      {customer.custBusinessname}
                    </Button>
                  </td>
                  <td className="text-right">
                    {formatCurrency(customer.balance)}
                  </td>
                  <td>
                    {new Date(customer.last_transaction_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}
