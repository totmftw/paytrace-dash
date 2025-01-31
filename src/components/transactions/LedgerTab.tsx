import { jsPDF } from "jspdf";
import "jspdf-autotable";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PDFExport } from "@/components/buttons/PDFExport";
import { CustomerSelector } from "@/components/transactions/CustomerSelector";

export default function LedgerTab({ year }: { year: string }) {
  const { user } = useAuth();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<any>({});

  const [startYear] = year.split('-');
  const endYear = parseInt(startYear) + 1;

  // Fetch customer options and ledger data
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
        p_start_date: `${startYear}-04-01`,
        p_end_date: `${endYear}-03-31`
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCustomerId
  });

  // Fetch buyer details
  React.useEffect(() => {
    if (selectedCustomerId) {
      supabase.from('customerMaster')
        .select('*')
        .eq('id', selectedCustomerId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching customer details:', error);
          }
          setBuyerInfo(data);
        });
    }
  }, [selectedCustomerId]);

  // PDF generation function
  const handlePDFDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Seller: MKD Enterprises, Bengaluru`, 10, 10);
    doc.text(`Buyer: ${buyerInfo?.custBusinessname}, ${buyerInfo?.address}, GST: ${buyerInfo?.gst}, Phone: ${buyerInfo?.custWhatsapp}`, 10, 15);
    
    doc.autoTable({
      head: [['Date', 'Reference', 'Type', 'Amount', 'Balance']],
      body: ledgerData.map((entry) => [
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
        <CustomerSelector
          customers={customers}
          isLoading={isLoadingCustomers}
          selectedCustomerId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />
        <div className="flex items-center gap-2">
          {user?.role === 'it_admin' && (
            <Button variant="ghost" onClick={() => console.log('Configure Columns')}>
              Configure Columns
            </Button>
          )}
          <PDFExport
            onClick={handlePDFDownload}
          />
        </div>
      </div>
      <DataTable
        columns={[
          { key: "date", header: "Date", cell: (item: any) => new Date(item.date).toLocaleDateString() },
          { key: "reference", header: "Reference", cell: (item: any) => item.type === 'credit' ? item.transactionId : item.invoiceNumber },
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