import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { MetricsCard } from '@/components/dashboard/metrics/MetricsCard';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { SalesVsPaymentsChart } from '@/components/dashboard/SalesVsPaymentsChart';
import { useToast } from '@/hooks/use-toast';
import { FinancialYearSelector } from '@/components/FinancialYearSelector';
import { Button } from '@/components/ui/button';

const defaultLayout = [
  { i: 'totalSales', x: 0, y: 0, w: 4, h: 5 },
  { i: 'pendingPayments', x: 4, y: 0, w: 4, h: 5 },
  { i: 'outstandingPayments', x: 8, y: 0, w: 4, h: 5 },
  { i: 'totalInvoices', x: 0, y: 5, w: 4, h: 5 },
  { i: 'invoiceTable', x: 4, y: 5, w: 8, h: 10 },
  { i: 'salesChart', x: 0, y: 10, w: 12, h: 10 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedYear } = useFinancialYear();
  const { toast } = useToast();
  const isITAdmin = user?.role === 'it_admin';

  const { data: layoutData } = useQuery({
    queryKey: ['dashboard-layout', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('layout')
        .eq('created_by', user?.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data?.layout ? JSON.parse(data.layout) : defaultLayout;
    },
    enabled: !!user,
  });

  const [currentLayout, setCurrentLayout] = useState(layoutData || defaultLayout);
  const [isLayoutEditable, setIsLayoutEditable] = useState(false);

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      if (!user) throw new Error('No user');
      
      const { error } = await supabase
        .from('dashboard_layouts')
        .upsert({
          created_by: user.id,
          layout: JSON.stringify(newLayout),
          is_active: true
        });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save layout'
        });
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Layout saved successfully'
      });
    },
  });

  const handleLayoutChange = (layout: any) => {
    setCurrentLayout(layout);
  };

  const handleApply = async () => {
    await updateLayoutMutation.mutateAsync(currentLayout);
    setIsLayoutEditable(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center gap-4">
        <FinancialYearSelector />
        {isITAdmin && (
          <Button
            variant={isLayoutEditable ? 'destructive' : 'outline'}
            onClick={() => setIsLayoutEditable(!isLayoutEditable)}
          >
            {isLayoutEditable ? 'Cancel Editing' : 'Configure Layout'}
          </Button>
        )}
      </div>
      {isLayoutEditable && isITAdmin && (
        <Button onClick={handleApply}>
          Apply Changes
        </Button>
      )}
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={12}
        rowHeight={30}
        width={1200}
        margin={[10, 10]}
        isDraggable={isLayoutEditable}
        isResizable={isLayoutEditable}
        onLayoutChange={handleLayoutChange}
      >
        <MetricsCard
          title="Total Sales"
          value={0}
          onClick={() => {}}
        />
        <MetricsCard
          title="Pending Payments"
          value={0}
          onClick={() => {}}
        />
        <MetricsCard
          title="Outstanding Payments"
          value={0}
          onClick={() => {}}
        />
        <MetricsCard
          title="Total Invoices"
          value={0}
          onClick={() => {}}
        />
        <InvoiceTable selectedYear={selectedYear} />
        <SalesVsPaymentsChart selectedYear={selectedYear} />
      </GridLayout>
    </div>
  );
}