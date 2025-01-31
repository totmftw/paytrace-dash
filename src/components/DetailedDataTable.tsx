import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice } from '@/types';

interface DetailedDataTableProps {
  title: string;
  invoices: Invoice[];
  onClose: () => void;

export function DetailedDataTable({ title, data, onClose }: DetailedDataTableProps) {
  return (
    <Dialog open={data.length > 0} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold mb-4">{title}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((invoice) => (
              <TableRow key={invoice.invId}>
                <TableCell>{invoice.invNumber}</TableCell>
                <TableCell>{invoice.customerMaster?.custBusinessname}</TableCell>
                <TableCell className="text-right">{invoice.invTotal.toLocaleString()}</TableCell>
                <TableCell>{new Date(invoice.invDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.invDuedate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {new Date(invoice.invDuedate) < new Date() ? "Overdue" : "Pending"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
interface DetailedDataTableProps {
  title: string;
  data?: any[];
  onClose: () => void;
}
}

export function DetailedDataTable({ title, data, onClose }: DetailedDataTableProps) {
  return (
    <Dialog open={title !== ""} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogTitle className="text-lg font-bold mb-4">{title}</DialogTitle>
        <ScrollArea className="h-[calc(80vh-7rem)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Invoice #</TableHead>
                <TableHead className="w-48">Customer</TableHead>
                <TableHead className="w-24">Amount</TableHead>
                <TableHead className="w-32">Invoice Date</TableHead>
                <TableHead className="w-32">Due Date</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((invoice) => (
                <TableRow key={invoice.invId}>
                  <TableCell>{invoice.invNumber}</TableCell>
                  <TableCell>{invoice.customerMaster?.custBusinessname}</TableCell>
                  <TableCell className="text-right">{invoice.invTotal}</TableCell>
                  <TableCell>{new Date(invoice.invDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.invDuedate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {new Date(invoice.invDuedate) < new Date()
                      ? "Overdue"
                      : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}