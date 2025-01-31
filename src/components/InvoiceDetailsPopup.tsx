import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice } from '@/types/types';

interface InvoiceDetailsPopupProps {
  invoiceId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailsPopup({ invoiceId, isOpen, onClose }: InvoiceDetailsPopupProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
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
        .eq('invId', invoiceId)
        .single();

      if (error) throw error;
      return data as Invoice;
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
            <h3 className="text-lg font-bold">Invoice #{data?.invNumber}</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Customer</dt>
                <dd className="text-gray-900">{data?.customerMaster?.custBusinessname}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Total Amount</dt>
                <dd className="text-gray-900">₹{data?.invTotal.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Invoice Date</dt>
                <dd className="text-gray-900">{new Date(data?.invDate || '').toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Due Date</dt>
                <dd className="text-gray-900">{new Date(data?.invDuedate || '').toLocaleDateString()}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Payment History</h4>
              {data?.paymentTransactions?.map((payment) => (
                <div key={payment.paymentId} className="flex justify-between py-2 border-t">
                  <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                  <span>₹{payment.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}