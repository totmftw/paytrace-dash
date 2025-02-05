
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/types';

interface DashboardProps {
  year: string;
}

export default function Dashboard({ year }: DashboardProps) {
  const { data: invoices, error, isLoading } = useQuery({
    queryKey: ['invoices', year],
    queryFn: async () => {
      const [startYear, endYear] = year.split('-');
      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          *,
          customerMaster:customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname,
            custCreditperiod,
            custWhatsapp,
            custPhone,
            custGST
          ),
          paymentTransactions!paymentTransactions_invId_fkey (
            paymentId,
            invId,
            amount,
            paymentDate,
            transactionId,
            paymentMode,
            chequeNumber,
            bankName,
            remarks
          )
        `)
        .gte('invDate', `${startYear}-04-01`)
        .lte('invDate', `${endYear}-03-31`);

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      return data as unknown as Invoice[];
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard data</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div>
        {invoices?.map((invoice) => (
          <div key={invoice.invId}>
            <h3>Invoice Number: {invoice.invNumber}</h3>
            <p>Customer: {invoice.customerMaster.custBusinessname}</p>
            <p>Total: {invoice.invTotal}</p>
            <p>Status: {invoice.invPaymentStatus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
