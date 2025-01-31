import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { TableContent } from "@/components/TableContent";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceDetailsPopup } from "@/components/InvoiceDetailsPopup";

interface Invoice {
  invId: number;
  invNumber: string;
  invDate: string;
  invDuedate: string;
  invTotal: number;
  customerMaster: {
    custBusinessname: string;
  };
}

export function InvoiceTable() {
  const { selectedYear } = useFinancialYear();
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);

  const { data: invoices } = useQuery({
    queryKey: ["invoices", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          )
        `)
        .gte("invDate", selectedYear.split('-')[0] + "-04-01")
        .lte("invDate", selectedYear.split('-')[1] + "-03-31");
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const columns = [
    {
      accessorKey: "invNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedInvoice(row.original.invId);
            setIsInvoiceDetailOpen(true);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          {row.original.invNumber}
        </button>
      ),
    },
    { accessorKey: "customerMaster.custBusinessname", header: "Customer" },
    { accessorKey: "invDate", header: "Invoice Date" },
    { accessorKey: "invDuedate", header: "Due Date" },
    { accessorKey: "invTotal", header: "Total Amount" },
  ];

  const table = useReactTable({
    data: invoices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full overflow-y-auto">
      <TableContent table={table} />
      {isInvoiceDetailOpen && (
        <InvoiceDetailsPopup
          invoiceId={selectedInvoice || 0}
          isOpen={isInvoiceDetailOpen}
          onClose={() => setIsInvoiceDetailOpen(false)}
        />
      )}
    </div>
  );
}