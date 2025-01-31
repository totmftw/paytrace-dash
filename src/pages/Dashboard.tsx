import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardGridLayout } from '@/components/DashboardGridLayout';
import { FinancialYearSelector } from '@/components/FinancialYearSelector';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { PaymentMetrics } from '@/components/dashboard/PaymentMetrics';
import { SalesOverview } from '@/components/dashboard/SalesOverview';
import { PaymentTracking } from '@/components/dashboard/PaymentTracking';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { SalesVsPaymentsChart } from '@/components/dashboard/SalesVsPaymentsChart';
import { DashboardWidget } from '@/types/dashboard';

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'payment-metrics',
    content: <PaymentMetrics />,
    x: 0,
    y: 0,
    w: 6,
    h: 4,
  },
  {
    id: 'sales-overview',
    content: <SalesOverview />,
    x: 6,
    y: 0,
    w: 6,
    h: 4,
  },
  {
    id: 'payment-tracking',
    content: <PaymentTracking />,
    x: 0,
    y: 4,
    w: 6,
    h: 4,
  },
  {
    id: 'invoice-table',
    content: <InvoiceTable />,
    x: 6,
    y: 4,
    w: 6,
    h: 4,
  },
  {
    id: 'sales-vs-payments',
    content: <SalesVsPaymentsChart />,
    x: 0,
    y: 8,
    w: 12,
    h: 6,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === 'it_admin';
  const { selectedYear } = useFinancialYear();

  const { data: layoutData } = useQuery({
    queryKey: ['dashboard-layout', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('dashboard_layouts')
        .upsert({
          created_by: user.id,
          layout: JSON.stringify(newLayout),
          is_active: true,
        });
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Layout saved successfully',
      });
    },
  });

  const currentLayout = layoutData?.layout ? JSON.parse(layoutData.layout) : defaultWidgets;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <FinancialYearSelector />
      </div>
      <DashboardGridLayout
        widgets={currentLayout}
        onLayoutChange={updateLayoutMutation.mutate}
        isEditMode={isITAdmin}
      />
    </div>
  );
}