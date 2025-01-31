import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DetailedDataTableProps {
  title: string;
  data?: any[];
  onClose: () => void;
}

export function DetailedDataTable({ title, data = [], onClose }: DetailedDataTableProps) {
  return (
    <Dialog open={title !== ""} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold mb-4">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-7rem)]">
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
              {data.map((invoice) => (
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