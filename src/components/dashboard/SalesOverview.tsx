import React from 'react';
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialYear } from '@/contexts/FinancialYearContext';

const SalesOverview = () => {
  const { selectedYear } = useFinancialYear();

  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['sales-overview', selectedYear],
    queryFn: async () => {
      const startDate = new Date(Number(selectedYear), 3, 1); // Financial year starts from April
      const endDate = new Date(Number(selectedYear) + 1, 2, 31); // Ends in March next year

      const { data: invoices, error } = await supabase
        .from('invoiceTable')
        .select(`
          invTotal,
          invBalanceAmount,
          invDate,
          paymentTransactions (
            amount,
            paymentDate
          ),
          customerMaster!invoiceTable_invCustid_fkey (
            custBusinessname
          )
        `)
        .gte('invDate', startDate.toISOString())
        .lte('invDate', endDate.toISOString());

      if (error) {
        console.error('Error fetching sales data:', error);
        return [];
      }

      const monthlyData = Array(12).fill(0).map((_, index) => {
        const month = new Date(Number(selectedYear), index + 3, 1);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.invDate);
          return invDate.getMonth() === month.getMonth() && 
                 invDate.getFullYear() === month.getFullYear();
        });

        const sales = monthInvoices.reduce((sum, inv) => sum + Number(inv.invTotal), 0);
        const collections = monthInvoices.reduce((sum, inv) => {
          const payments = inv.paymentTransactions || [];
          return sum + payments.reduce((pSum, p) => pSum + Number(p.amount), 0);
        }, 0);
        const pending = monthInvoices.reduce((sum, inv) => sum + Number(inv.invBalanceAmount), 0);

        return {
          month: monthName,
          sales: Math.round(sales),
          collections: Math.round(collections),
          pending: Math.round(pending)
        };
      });

      return monthlyData;
    }
  });

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  if (isLoading) {
    return <Card className="w-full h-[400px] animate-pulse" />;
  }

  return (
    <Card className="w-full h-[400px] p-4">
      <div className="h-full">
        <h3 className="text-lg font-semibold mb-4">Sales & Collections Overview</h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="sales" fill="#22c55e" name="Sales" />
              <Bar dataKey="pending" fill="#eab308" name="Pending" />
              <Line 
                type="monotone" 
                dataKey="collections" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Collections"
              />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default SalesOverview;