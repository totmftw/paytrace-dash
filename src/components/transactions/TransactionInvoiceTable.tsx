import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface TransactionInvoiceTableProps {
  data: any[];
  onCustomerClick: (customer: any) => void;
  onInvoiceClick: (invoice: any) => void;
}

export function TransactionInvoiceTable({
  data,
  onCustomerClick,
  onInvoiceClick,
}: TransactionInvoiceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((invoice) =>
    invoice.customerMaster?.custBusinessname
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const downloadTemplate = () => {
    const template = [
      {
        CustomerName: 'Example Customer',
        InvoiceNumber: '2024-001',
        InvoiceDate: '2024-01-01',
        DueDate: '2024-02-01',
        Value: 1000,
        GST: 180,
        AdditionalAmount: 0,
        SubtractedAmount: 0,
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "invoice-template.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            Download Template
          </Button>
          <Button asChild>
            <label htmlFor="invoice-upload">Upload Invoices</label>
          </Button>
          <input
            type="file"
            id="invoice-upload"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              console.log(e.target.files?.[0]);
            }}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((invoice) => (
                  <TableRow key={invoice.invId}>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => onInvoiceClick(invoice)}
                      >
                        {invoice.invNumber.join("-")}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => onCustomerClick({
                          id: invoice.customerMaster.id,
                          name: invoice.customerMaster.custBusinessname,
                          whatsappNumber: invoice.customerMaster.custWhatsapp
                        })}
                      >
                        {invoice.customerMaster.custBusinessname}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invDuedate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.invTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}