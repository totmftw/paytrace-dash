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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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
  const { toast } = useToast();

  // Use useQuery to fetch customers for validation
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("id, custBusinessname");
      if (error) throw error;
      return data;
    },
  });

  const filteredData = data.filter((invoice) =>
    invoice.customerMaster?.custBusinessname
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const downloadTemplate = () => {
    const template = [{
      invCustid: 'Customer ID (number)',
      invNumber: 'Invoice Number',
      invDate: 'YYYY-MM-DD',
      invDuedate: 'YYYY-MM-DD',
      invValue: 0,
      invGst: 0,
      invAddamount: 0,
      invSubamount: 0,
      invTotal: 0,
      invReminder1: false,
      invRemainder2: false,
      invRemainder3: false,
      invMarkcleared: false,
      invAlert: '',
      invMessage1: '',
      invMessage2: '',
      invMessage3: '',
      invBalanceAmount: 0,
      invPaymentDifference: 0,
      invPaymentStatus: 'pending'
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    ws['!cols'] = Object.keys(template[0]).map(() => ({ wch: 20 }));
    XLSX.writeFile(wb, "invoice-template.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error("No valid data found in the Excel file");
        }

        // Validate customer IDs before processing
        const customerIds = customers?.map(c => c.id) || [];
        
        // Process and validate each row
        const invoices = jsonData.map((row: any) => {
          const custId = Number(row.invCustid);
          if (!customerIds.includes(custId)) {
            throw new Error(`Invalid customer ID: ${custId}`);
          }

          return {
            invCustid: custId,
            invNumber: row.invNumber?.toString(),
            invDate: row.invDate,
            invDuedate: row.invDuedate,
            invValue: Number(row.invValue) || 0,
            invGst: Number(row.invGst) || 0,
            invAddamount: Number(row.invAddamount) || 0,
            invSubamount: Number(row.invSubamount) || 0,
            invTotal: Number(row.invTotal) || 0,
            invReminder1: Boolean(row.invReminder1),
            invRemainder2: Boolean(row.invRemainder2),
            invRemainder3: Boolean(row.invRemainder3),
            invMarkcleared: Boolean(row.invMarkcleared),
            invAlert: row.invAlert || '',
            invMessage1: row.invMessage1 || '',
            invMessage2: row.invMessage2 || '',
            invMessage3: row.invMessage3 || '',
            invBalanceAmount: Number(row.invBalanceAmount) || 0,
            invPaymentDifference: Number(row.invPaymentDifference) || 0,
            invPaymentStatus: row.invPaymentStatus || 'pending'
          };
        });

        const { error } = await supabase
          .from('invoiceTable')
          .insert(invoices);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Successfully uploaded ${invoices.length} invoices`,
        });
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to read the Excel file",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload invoice data",
      });
    } finally {
      // Reset the input
      e.target.value = '';
    }
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
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-semibold">Invoice Number</TableHead>
                  <TableHead className="text-sm font-semibold">Customer Name</TableHead>
                  <TableHead className="text-sm font-semibold">Invoice Date</TableHead>
                  <TableHead className="text-sm font-semibold">Due Date</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Total Amount</TableHead>
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
                        {invoice.invNumber}
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