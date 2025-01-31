import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PaymentData {
  invId: number;
  transactionId: string;
  paymentDate: string;
  amount: number;
  paymentMode: "cash" | "cheque" | "online";
  remarks: string;
  chequeNumber?: string;
  bankName?: string;
}

export function AddPaymentButton() {
  const [selectedInvoices, setSelectedInvoices] = useState<{ id: string; number: string; }[]>([]);

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
    <Button onClick={() => handlePayment(selectedInvoices)}>
      Add Payment
    </Button>
  );
}
