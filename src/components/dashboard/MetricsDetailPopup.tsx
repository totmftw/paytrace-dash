import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import type { Invoice } from "@/types";

interface MetricsDetailPopupProps {
  invoiceId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MetricsDetailPopup({
  invoiceId,
  isOpen,
  onClose,
}: MetricsDetailPopupProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            amount,
            paymentDate
          )
        `)
        .eq("invId", invoiceId)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Invoice Details</DialogTitle>
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
                  {data?.invDate ? new Date(data.invDate).toLocaleDateString() : '-'}
                </dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Customer</dt>
                <dd className="text-gray-900">
                  {data?.customerMaster?.custBusinessname || '-'}
                </dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Total</dt>
                <dd className="text-gray-900">
                  {data?.invTotal ? formatCurrency(data.invTotal) : '-'}
                </dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-sm text-gray-600">Due Date</dt>
                <dd className="text-gray-900">
                  {data?.invDuedate ? new Date(data.invDuedate).toLocaleDateString() : '-'}
                </dd>
              </div>
            </dl>
            <h4 className="text-sm font-bold mt-4">Payments Made</h4>
            <ul>
              {data?.paymentTransactions?.map((payment) => (
                <li
                  key={payment.paymentId}
                  className="text-gray-700 text-sm flex items-center py-1"
                >
                  ₹{payment.amount.toLocaleString("en-IN")}{" "}
                  <span className="text-gray-500 ml-2">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white rounded-md px-4 py-2 shadow text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
