import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PaymentMetrics() {
  const { selectedYear } = useFinancialYear();
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);

  const { data } = useQuery({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname
          )
        `)
        .gte("invDate", `${selectedYear}-04-01`)
        .lte("invDate", `${+selectedYear + 1}-03-31`);

      return invoices;
    },
  });

  const [pending, overdue, totalSales] = data?.reduce(
    ([p, o, t], invoice) => {
      const isOverdue = new Date(invoice.invDuedate) < new Date();
      return [
        p + (isOverdue ? 0 : invoice.invTotal),
        o + (isOverdue ? invoice.invTotal : 0),
        t + invoice.invTotal,
      ];
    },
    [0, 0, 0]
  ) ?? [0, 0, 0];

  return (
    <>
      <Card className="cursor-pointer" onClick={() => setModalData(data ?? [])}>
        <CardHeader>
          <CardTitle>Payments Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-xl font-bold">
              {formatCurrency(pending)}
              <div className="text-gray-500">Pending Payments</div>
            </div>
            <div className="text-xl font-bold text-red-500">
              {formatCurrency(overdue)}
              <div className="text-gray-500">Overdue Payments</div>
            </div>
            <div className="text-xl font-bold text-green-500">
              {formatCurrency(totalSales)}
              <div className="text-gray-500">Total Sales</div>
            </div>
          </div>
          <Button onClick={() => setOpen(true)}>View Details</Button>
        </CardContent>
      </Card>

      <DetailedDataTable
        title="Payment Details"
        data={modalData}
        onClose={() => setOpen(false)}
      />
    </>
  );
}