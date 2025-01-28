import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const InvoicesAndPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase.from('invoiceTable').select('*');
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching invoices',
          description: error.message,
        });
      } else {
        setInvoices(data);
      }
    };

    const fetchPayments = async () => {
      const { data, error } = await supabase.from('paymentTransactions').select('*');
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching payments',
          description: error.message,
        });
      } else {
        setPayments(data);
      }
    };

    fetchInvoices();
    fetchPayments();
  }, [toast]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Invoices and Payments</h1>
      <div>
        <h2 className="text-xl">Invoices</h2>
        <ul>
          {invoices.map((invoice) => (
            <li key={invoice.invId}>{invoice.invId}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl">Payments</h2>
        <ul>
          {payments.map((payment) => (
            <li key={payment.paymentId}>{payment.paymentId}</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between">
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default InvoicesAndPayments;