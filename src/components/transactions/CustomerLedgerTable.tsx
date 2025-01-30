import { useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Download, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CustomerLedgerTableProps {
  onCustomerClick: (customer: { id: number; name: string; whatsappNumber: number }) => void;
}

export function CustomerLedgerTable({ onCustomerClick }: CustomerLedgerTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();
  const { toast } = useToast();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customerMaster')
        .select('id, custBusinessname, custWhatsapp')
        .order('custBusinessname');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: ledgerEntries = [], isLoading: isLoadingLedger } = useQuery({
    queryKey: ['customer-ledger', selectedCustomerId, selectedYear],
    queryFn: async () => {
      if (!selectedCustomerId) return [];

      const { data, error } = await supabase
        .rpc('get_customer_ledger', {
          p_customer_id: selectedCustomerId,
          p_start_date: start.toISOString(),
          p_end_date: end.toISOString()
        });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCustomerId,
  });

  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      onCustomerClick({
        id: customer.id,
        name: customer.custBusinessname,
        whatsappNumber: customer.custWhatsapp
      });
    }
    setOpen(false);
  };

  const handleDownloadPDF = async () => {
    if (!selectedCustomerId || !ledgerEntries.length) return;
    
    try {
      const response = await supabase.functions.invoke('generate-ledger-pdf', {
        body: { 
          customerId: selectedCustomerId,
          entries: ledgerEntries,
          year: selectedYear
        }
      });

      if (response.error) throw response.error;

      const url = response.data.url;
      const link = document.createElement('a');
      link.href = url;
      link.download = `ledger-${selectedCustomerId}-${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Ledger PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download ledger PDF",
      });
    }
  };

  const handleSendWhatsApp = async () => {
    if (!selectedCustomerId || !ledgerEntries.length) return;
    
    try {
      const response = await supabase.functions.invoke('send-ledger-whatsapp', {
        body: { 
          customerId: selectedCustomerId,
          entries: ledgerEntries,
          year: selectedYear
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Ledger sent successfully via WhatsApp",
      });
    } catch (error) {
      console.error('Error sending ledger:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send ledger via WhatsApp",
      });
    }
  };

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  if (isLoadingCustomers) {
    return <div className="text-center py-4">Loading customers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[300px] justify-between"
              >
                {selectedCustomer
                  ? selectedCustomer.custBusinessname
                  : "Select customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search customer..." />
                <CommandEmpty>No customer found.</CommandEmpty>
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.custBusinessname}
                      onSelect={() => handleCustomerSelect(customer.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {customer.custBusinessname}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FinancialYearSelector />
        </div>
        {selectedCustomerId && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
              disabled={!ledgerEntries.length}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2"
              disabled={!ledgerEntries.length}
            >
              <Send className="h-4 w-4" />
              Send to WhatsApp
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Invoice Number</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingLedger ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading ledger entries...
                </td>
              </tr>
            ) : !selectedCustomerId ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Select a customer to view their ledger
                </td>
              </tr>
            ) : ledgerEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No transactions found for this period
                </td>
              </tr>
            ) : (
              ledgerEntries.map((entry, index) => (
                <tr key={`${entry.transaction_date}-${index}`}>
                  <td>{new Date(entry.transaction_date).toLocaleDateString()}</td>
                  <td>{entry.description}</td>
                  <td>{entry.invoice_number || '-'}</td>
                  <td className="text-right">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </td>
                  <td className="text-right">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </td>
                  <td className="text-right">{formatCurrency(entry.balance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}