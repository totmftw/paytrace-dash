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
      .insert({
        ...paymentData,
        paymentDate: format(new Date(paymentData.paymentDate), 'yyyy-MM-dd')
      });

    if (error) throw error;
  };

  return (
    <Button onClick={() => handlePayment({
      invId: 0, // This should be set with actual invoice ID
      amount: 0,
      paymentDate: new Date().toISOString(),
      paymentMode: 'cash',
      transactionId: 'temp-id'
    })}>
      Add Payment
    </Button>
  );
}