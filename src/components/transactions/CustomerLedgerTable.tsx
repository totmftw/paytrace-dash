import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerLedgerDialog } from "@/components/invoices-payments/CustomerLedgerDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

export function CustomerLedgerTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customer-ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_ledger_balance")
        .select("*")
        .order("custBusinessname");

      if (error) throw error;
      return data;
    },
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.custBusinessname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead className="text-right">Outstanding Amount</TableHead>
              <TableHead>Last Transaction Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers?.map((customer) => (
              <TableRow key={customer.custId}>
                <TableCell>
                  <Button
                    variant="link"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    {customer.custBusinessname}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(customer.balance)}
                </TableCell>
                <TableCell>
                  {new Date(customer.last_transaction_date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {selectedCustomer && (
        <CustomerLedgerDialog
          customerId={selectedCustomer.custId}
          customerName={selectedCustomer.custBusinessname}
          whatsappNumber={selectedCustomer.custWhatsapp}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}