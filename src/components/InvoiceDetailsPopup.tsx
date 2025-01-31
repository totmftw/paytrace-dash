import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

interface PaymentTransaction {
  paymentId: number;
  amount: number;
  paymentDate: string;
}

interface InvoiceDetailsPopupProps {
  invoiceId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailsPopup({
  invoiceId,
  isOpen,
  onClose,
}: InvoiceDetailsPopupProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          ),
          paymentTransactions (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .eq("invId", invoiceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <div>
            <h3 className="text-lg font-bold">
              Invoice # {data?.invNumber}
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Date</dt>
                <dd className="text-gray-900">
                  {new Date(data?.invDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Customer</dt>
                <dd className="text-gray-900">
                  {data?.customerMaster?.custBusinessname}
                </dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Total</dt>
                <dd className="text-gray-900">{data?.invTotal}</dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Due Date</dt>
                <dd className="text-gray-900">
                  {new Date(data?.invDuedate).toLocaleDateString()}
                </dd>
              </div>
            </dl>
            <h4 className="text-sm font-bold mt-4">Payments Made</h4>
            <ul>
              {data?.paymentTransactions?.map((payment: PaymentTransaction) => (
                <li key={payment.paymentId}>
                  ₹{payment.amount} -{" "}
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="bg-white rounded-md px-4 py-2">
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}