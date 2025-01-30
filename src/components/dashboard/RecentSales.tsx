import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialYear } from '@/contexts/FinancialYearContext';

export function RecentSales() {
  const { selectedYear } = useFinancialYear();

  const { data: recentSales = [], isLoading } = useQuery({
    queryKey: ['recent-sales', selectedYear],
    queryFn: async () => {
      const startDate = new Date(Number(selectedYear), 3, 1);
      const endDate = new Date(Number(selectedYear) + 1, 2, 31);

      const { data, error } = await supabase
        .from('invoiceTable')
        .select(`
          invId,
          invNumber,
          invTotal,
          invDate,
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          )
        `)
        .gte('invDate', startDate.toISOString())
        .lte('invDate', endDate.toISOString())
        .order('invDate', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="space-y-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {recentSales.map((sale) => (
        <div key={sale.invId} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.customerMaster?.custBusinessname}
            </p>
            <p className="text-sm text-muted-foreground">
              Invoice #{sale.invNumber}
            </p>
          </div>
          <div className="ml-auto font-medium">
            ₹{sale.invTotal.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  );
}