import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { DetailedDataTable } from "@/components/DetailedDataTable";
import { useState } from "react";

interface Invoice {
  invId: number;
  invNumber: string;
  invTotal: number;
  invDuedate: string;
  invDate: string;
  customerMaster: {
    custBusinessname: string;
  };
  paymentTransactions: Array<{
    amount: number;
  }>;
}

interface PaymentMetricsProps {
  onDetail: (type: string, data?: any[]) => void;
}

export function PaymentMetrics({ onDetail }: PaymentMetricsProps) {
  const { selectedYear } = useFinancialYear();
  const [selectedData, setSelectedData] = useState<Invoice[]>([]);

  const { data: metrics } = useQuery({
    queryKey: ["payment-metrics", selectedYear],
    queryFn: async () => {
      // Fetch and calculate metrics
    },
  });

  const handleMetricClick = (type: string) => {
    switch (type) {
      case "pending":
        setSelectedData(metrics?.pendingPayments || []);
        onDetail("Pending Payments", metrics?.pendingPayments || []);
        break;
      case "outstanding":
        onDetail("Outstanding Payments", metrics?.outstandingPayments || []);
        break;
      case "sales":
        onDetail("Total Sales", metrics?.allInvoices || []);
        break;
      case "orders":
        onDetail("Total Orders", metrics?.allInvoices || []);
        break;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric Cards */}
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleMetricClick("pending")}
      >
        {/* Card Content */}
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics?.totalPendingAmount || 0)}
          </div>
        </CardContent>
      </Card>
      {/* Repeat for other metrics */}
    </div>
  );
}