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

  const handlePayment = async (paymentData: PaymentData) => {
    const { error } = await supabase
      .from("paymentTransactions")
      .insert(paymentData);

    if (error) throw error;
  };

  return (
    <Button onClick={() => handlePayment({
      invId: 0,
      amount: 0,
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMode: 'cash',
      transactionId: 'temp-id'
    })}>
      Add Payment
    </Button>
  );
}