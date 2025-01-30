import React from "react";
import { TransactionInvoiceTable } from "./TransactionInvoiceTable";
import { Button } from "@/components/ui/button";
import DownloadTemplateButton from "@/components/buttons/DownloadTemplateButton";
import UploadInvoiceButton from "@/components/buttons/UploadInvoiceButton";

export default function PaymentTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button>Add Payment</Button>
        <DownloadTemplateButton tableName="paymentTransactions" />
        <UploadInvoiceButton tableName="paymentTransactions" />
      </div>
      
      <TransactionInvoiceTable 
        data={[]}
        onCustomerClick={(customer) => {}}
        onInvoiceClick={(invoice) => {}}
      />
    </div>
  );
}