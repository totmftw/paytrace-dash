import React from 'react';
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialYear } from '@/contexts/FinancialYearContext';

export const SalesOverview = () => {
  const { selectedYear } = useFinancialYear();

  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['sales-overview', selectedYear],
    queryFn: async () => {
      const startDate = new Date(Number(selectedYear), 3, 1); // Financial year starts from April
      const endDate = new Date(Number(selectedYear) + 1, 2, 31); // Ends in March next year

      const { data: invoices, error } = await supabase
        .from('invoiceTable')
        .select('invTotal, invBalanceAmount, invDate')
        .gte('invDate', startDate.toISOString())
        .lte('invDate', endDate.toISOString());

      if (error) {
        console.error('Error fetching sales data:', error);
        return [];
      }

      // Process the data to get monthly totals
      const monthlyData = Array(12).fill(0).map((_, index) => {
        const month = new Date(Number(selectedYear), index + 3, 1);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.invDate);
          return invDate.getMonth() === month.getMonth() && 
                 invDate.getFullYear() === month.getFullYear();
        });

        const sales = monthInvoices.reduce((sum, inv) => sum + Number(inv.invTotal), 0);
        const pending = monthInvoices.reduce((sum, inv) => {
          const balance = Number(inv.invBalanceAmount);
          const dueDate = new Date(inv.invDate);
          dueDate.setDate(dueDate.getDate() + 30); // Assuming 30 days credit period
          return sum + (balance > 0 && new Date() <= dueDate ? balance : 0);
        }, 0);
        const overdue = monthInvoices.reduce((sum, inv) => {
          const balance = Number(inv.invBalanceAmount);
          const dueDate = new Date(inv.invDate);
          dueDate.setDate(dueDate.getDate() + 30); // Assuming 30 days credit period
          return sum + (balance > 0 && new Date() > dueDate ? balance : 0);
        }, 0);

        return {
          month: monthName,
          sales,
          pending,
          overdue
        };
      });

      return monthlyData;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return <Card className="w-full h-[400px] animate-pulse" />;
  }

  return (
    <Card className="w-full h-[400px] p-4">
      <div className="h-full">
        <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value: number) => `₹${value / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="sales" fill="var(--color-sales)" />
              <Bar dataKey="pending" fill="var(--color-pending)" />
              <Bar dataKey="overdue" fill="var(--color-overdue)" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};