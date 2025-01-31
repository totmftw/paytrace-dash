import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { PaymentData } from "@/types/types";

interface SelectedInvoice {
  invId: number;
  invNumber: string;
}

export function AddPaymentButton() {
  const [selectedInvoices, setSelectedInvoices] = useState<SelectedInvoice[]>([]);

  const handlePayment = async (paymentData: PaymentData[]) => {
    const formattedPayments = paymentData.map(payment => ({
      ...payment,
      paymentDate: format(new Date(payment.paymentDate), 'yyyy-MM-dd')
    }));

    const { error } = await supabase
      .from("paymentTransactions")
      .insert(formattedPayments);

    if (error) throw error;
  };

  return (
    <Button onClick={() => handlePayment([])}>
      Add Payment
    </Button>
  );
}