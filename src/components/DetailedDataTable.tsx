import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface DetailedDataTableProps {
  title: string;
  data?: any[];
  onClose: () => void;
}

export function DetailedDataTable({ title, data, onClose }: DetailedDataTableProps) {
  return (
    <Dialog open={title !== ""} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogTitle className="text-lg font-bold mb-4">{title}</DialogTitle>
        <ScrollArea className="h-[calc(80vh-7rem)]">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Invoice #</TableHead>
                  <TableHead className="w-48">Customer</TableHead>
                  <TableHead className="w-24 text-right">Amount</TableHead>
                  <TableHead className="w-32">Invoice Date</TableHead>
                  <TableHead className="w-32">Due Date</TableHead>
                  <TableHead className="w-24 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((invoice) => (
                  <TableRow key={invoice.invId}>
                    <TableCell>{invoice.invNumber}</TableCell>
                    <TableCell>{invoice.customerMaster?.custBusinessname}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.invTotal)}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invDuedate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(invoice.invDuedate) < new Date()
                        ? "Overdue"
                        : "Pending"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}