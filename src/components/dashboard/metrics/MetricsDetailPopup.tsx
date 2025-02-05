import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Invoice } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface MetricsDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  invoices: Invoice[];
}

export function MetricsDetailPopup({ isOpen, onClose, title, invoices }: MetricsDetailPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-8rem)]">
          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Invoice #</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invId} className="border-t">
                    <td className="p-2">{invoice.invNumber}</td>
                    <td className="p-2">{invoice.customerMaster.custBusinessname}</td>
                    <td className="p-2">{new Date(invoice.invDate).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(invoice.invDuedate).toLocaleDateString()}</td>
                    <td className="p-2 text-right">{formatCurrency(invoice.invTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}