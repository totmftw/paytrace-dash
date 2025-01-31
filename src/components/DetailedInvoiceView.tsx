// src/components/DetailedInvoiceView.tsx
import { Dialog } from '@headlessui/react';
import { Invoice } from '@/types';
import { format } from 'date-fns';

interface DetailedInvoiceViewProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailedInvoiceView = ({ invoice, isOpen, onClose }: DetailedInvoiceViewProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <Dialog.Title className="text-xl font-bold mb-4">
            Invoice Details
          </Dialog.Title>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Customer Information</h3>
              <p>Name: {invoice.customerMaster?.custName}</p>
              <p>Address: {invoice.customerMaster?.custAddress}</p>
              <p>GST: {invoice.customerMaster?.custGst}</p>
              <p>Phone: {invoice.customerMaster?.custPhone}</p>
            </div>

            <div>
              <h3 className="font-semibold">Invoice Information</h3>
              <p>Invoice ID: {invoice.invId}</p>
              <p>Date: {format(new Date(invoice.invDate), 'dd/MM/yyyy')}</p>
              <p>Due Date: {format(new Date(invoice.invDuedate), 'dd/MM/yyyy')}</p>
              <p>Status: {invoice.invMarkcleared ? 'Cleared' : 'Pending'}</p>
            </div>

            <div className="col-span-2">
              <h3 className="font-semibold">Amount Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <p>Amount: ₹{invoice.invAmount.toFixed(2)}</p>
                <p>GST: ₹{invoice.invGst.toFixed(2)}</p>
                <p>Additional Amount: ₹{invoice.invAddamount.toFixed(2)}</p>
                <p>Balance: ₹{invoice.invBalanceAmount.toFixed(2)}</p>
              </div>
            </div>

            {invoice.paymentTransactions && invoice.paymentTransactions.length > 0 && (
              <div className="col-span-2">
                <h3 className="font-semibold">Payment History</h3>
                <table className="w-full mt-2">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.paymentTransactions.map(payment => (
                      <tr key={payment.transactionId}>
                        <td>{format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</td>
                        <td>₹{payment.amount.toFixed(2)}</td>
                        <td>{payment.paymentMode}</td>
                        <td>{payment.referenceNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
