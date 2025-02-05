import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface InvoiceDetailsDialogProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailsDialog({
  invoice,
  isOpen,
  onClose,
}: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Invoice Number</h3>
                <p>{invoice.invNumber.join("-")}</p>
              </div>
              <div>
                <h3 className="font-semibold">Date</h3>
                <p>{format(new Date(invoice.invDate), "PPP")}</p>
              </div>
              <div>
                <h3 className="font-semibold">Due Date</h3>
                <p>{format(new Date(invoice.invDuedate), "PPP")}</p>
              </div>
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p>{invoice.customerMaster.custBusinessname}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Amount Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Base Amount:</div>
                <div className="text-right">{formatCurrency(invoice.invValue)}</div>
                <div>GST:</div>
                <div className="text-right">{formatCurrency(invoice.invGst)}</div>
                {invoice.invAddamount && (
                  <>
                    <div>Additional Amount:</div>
                    <div className="text-right">{formatCurrency(invoice.invAddamount)}</div>
                  </>
                )}
                {invoice.invSubamount && (
                  <>
                    <div>Subtracted Amount:</div>
                    <div className="text-right">{formatCurrency(invoice.invSubamount)}</div>
                  </>
                )}
                <div className="font-semibold">Total:</div>
                <div className="text-right font-semibold">{formatCurrency(invoice.invTotal)}</div>
                <div className="font-semibold">Balance:</div>
                <div className="text-right font-semibold">{formatCurrency(invoice.invBalanceAmount)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Payment Status</h3>
              <p className="capitalize">{invoice.invPaymentStatus}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Reminder Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>First Reminder:</div>
                <div>{invoice.invReminder1 ? "Sent" : "Not Sent"}</div>
                <div>Second Reminder:</div>
                <div>{invoice.invRemainder2 ? "Sent" : "Not Sent"}</div>
                <div>Third Reminder:</div>
                <div>{invoice.invRemainder3 ? "Sent" : "Not Sent"}</div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}