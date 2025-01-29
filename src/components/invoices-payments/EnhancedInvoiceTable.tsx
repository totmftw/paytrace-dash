import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ReminderMessageForm } from "../invoices/ReminderMessageForm";
import { PaymentForm } from "../invoices/PaymentForm";
import { InvoiceForm } from "../invoices/InvoiceForm";

export function EnhancedInvoiceTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { user } = useAuth();
  const canEdit = user?.role && ['it_admin', 'business_owner'].includes(user.role);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster (
            custBusinessname
          )
        `)
        .order('invDate', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.customerMaster.custBusinessname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowSelect = (invoiceId: number) => {
    setSelectedRows(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (filteredInvoices) {
      setSelectedRows(
        selectedRows.length === filteredInvoices.length
          ? []
          : filteredInvoices.map(inv => inv.invId)
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setShowInvoiceForm(true)}>
          Add Single Invoice
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] border rounded-md">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === filteredInvoices?.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Outstanding Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices?.map((invoice) => (
                <TableRow key={invoice.invId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(invoice.invId)}
                      onCheckedChange={() => handleRowSelect(invoice.invId)}
                    />
                  </TableCell>
                  <TableCell>{invoice.customerMaster.custBusinessname}</TableCell>
                  <TableCell>{invoice.invNumber.join("-")}</TableCell>
                  <TableCell>{formatCurrency(invoice.invTotal)}</TableCell>
                  <TableCell>{formatCurrency(invoice.invBalanceAmount)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowReminderForm(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {showReminderForm && selectedInvoice && (
        <ReminderMessageForm
          invoice={selectedInvoice}
          isOpen={showReminderForm}
          onClose={() => {
            setShowReminderForm(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowReminderForm(false);
            setSelectedInvoice(null);
          }}
          reminderNumber={1}
        />
      )}

      {showPaymentForm && selectedInvoice && (
        <PaymentForm
          invoice={selectedInvoice}
          isOpen={showPaymentForm}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowPaymentForm(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {showInvoiceForm && (
        <InvoiceForm
          isOpen={showInvoiceForm}
          onClose={() => {
            setShowInvoiceForm(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowInvoiceForm(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}