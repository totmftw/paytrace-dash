import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicePaymentTable } from "@/components/invoices-payments/InvoicePaymentTable";
import { CustomerLedgerDialog } from "@/components/invoices-payments/CustomerLedgerDialog";
import { InvoiceDetailsDialog } from "@/components/invoices-payments/InvoiceDetailsDialog";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { Download } from "lucide-react";

export default function InvoicesAndPayments() {
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: combinedData, isLoading } = useQuery({
    queryKey: ["invoices-payments"],
    queryFn: async () => {
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            id,
            custBusinessname,
            custAddress,
            custPhone,
            custEmail
          )
        `)
        .order('invDate', { ascending: false });

      if (invoicesError) throw invoicesError;

      const { data: payments, error: paymentsError } = await supabase
        .from("paymentTransactions")
        .select(`
          *,
          invoiceTable (
            invNumber,
            customerMaster (
              id,
              custBusinessname
            )
          )
        `)
        .order('paymentDate', { ascending: false });

      if (paymentsError) throw paymentsError;

      return { invoices, payments };
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Invoices & Payments</h2>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <ExcelUpload />
        </div>
      </div>

      <Tabs defaultValue="combined" className="space-y-4">
        <TabsList>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
        </TabsList>

        <TabsContent value="combined">
          <InvoicePaymentTable
            data={combinedData?.invoices || []}
            onCustomerClick={setSelectedCustomer}
            onInvoiceClick={setSelectedInvoice}
          />
        </TabsContent>

        <TabsContent value="upload">
          <div className="grid gap-4">
            <ExcelUpload type="invoices" />
            <ExcelUpload type="payments" />
          </div>
        </TabsContent>
      </Tabs>

      {selectedCustomer && (
        <CustomerLedgerDialog
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailsDialog
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}