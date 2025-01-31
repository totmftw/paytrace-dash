import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import AddPaymentButton from "../buttons/AddPaymentButton";
import DownloadTemplateButton from "../buttons/DownloadTemplateButton";
import UploadDataButton from "../buttons/UploadDataButton";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export default function PaymentTab({ year }: { year: string }) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paymentTransactions")
        .select('*')
        .gte("paymentDate", `${year}-04-01`)
        .lte("paymentDate", `${parseInt(year) + 1}-03-31`);

      if (error) throw error;
      return data || [];
    }
  });

  const columns = [
    {
      key: "paymentDate",
      header: "Date",
      cell: (item: any) => new Date(item.paymentDate).toLocaleDateString()
    },
    {
      key: "transactionId",
      header: "Transaction ID"
    },
    {
      key: "paymentMode",
      header: "Payment Mode"
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item: any) => item.amount.toFixed(2)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AddPaymentButton />
        <DownloadTemplateButton 
          columns={[
            { label: "Payment ID", key: "paymentId" },
            { label: "Invoice ID", key: "invId" },
            { label: "Transaction ID", key: "transactionId" },
            { label: "Payment Date", key: "paymentDate" },
            { label: "Amount", key: "amount" },
            { label: "Payment Mode", key: "paymentMode" },
          ]}
          tableName="paymentTransactions"
        />
        <UploadDataButton tableName="paymentTransactions" />
      </div>
      
      <DataTable
        columns={columns}
        data={payments || []}
        isLoading={isLoading}
      />
    </div>
  );
}