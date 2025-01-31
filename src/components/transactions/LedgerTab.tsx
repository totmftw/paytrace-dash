import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PDFExport } from "@/components/buttons/PDFExport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function LedgerTab({ year }: { year: string }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customerMaster").select("id, custBusinessname");
      if (error) throw error;
      return data || [];
    }
  });

  const { data: ledgerData, isLoading: isLoadingLedger } = useQuery({
    queryKey: ["ledger", selectedCustomerId, year],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const { data, error } = await supabase.rpc("get_customer_ledger", {
        p_customer_id: selectedCustomerId,
        p_start_date: `${year}-04-01`,
        p_end_date: `${parseInt(year) + 1}-03-31`
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCustomerId
  });

  const handlePDFDownload = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Date', 'Reference', 'Type', 'Amount', 'Balance']],
      body: ledgerData.map((entry: any) => [
        new Date(entry.date).toLocaleDateString(),
        entry.type === 'credit' ? entry.transactionId : entry.invoiceNumber,
        entry.type,
        formatCurrency(entry.amount),
        formatCurrency(entry.balance)
      ])
    });
    doc.save('ledger.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select 
          value={selectedCustomerId?.toString() || ''}
          onValueChange={(value) => setSelectedCustomerId(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            {customers?.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.custBusinessname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handlePDFDownload} disabled={!selectedCustomerId}>
          Export PDF
        </Button>
      </div>
      <DataTable
        columns={[
          { key: "date", header: "Date", cell: (item: any) => new Date(item.date).toLocaleDateString() },
          { key: "reference", header: "Reference" },
          { key: "type", header: "Type" },
          { key: "amount", header: "Amount", cell: (item: any) => formatCurrency(item.amount) },
          { key: "balance", header: "Balance", cell: (item: any) => formatCurrency(item.balance) },
        ]}
        data={ledgerData || []}
        isLoading={isLoadingLedger || isLoadingCustomers}
      />
    </div>
  );
}
