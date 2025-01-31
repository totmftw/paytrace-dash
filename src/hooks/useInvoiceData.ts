// src/hooks/useInvoiceData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Invoice } from '@/types/types';

export const useInvoiceData = (year: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            customerMaster:customers(*),
            paymentTransactions:payment_transactions(*)
          `)
          .eq('fy', year);

        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [year]);

  return { invoices, loading, error };
};
