import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { DashboardWidget } from '@/types/dashboard';
import { Layout } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import { Card } from '@/components/ui/card';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { CustomerList } from '@/components/dashboard/CustomerList';
import { PaymentHistory } from '@/components/dashboard/PaymentHistory';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'metrics',
    content: <MetricsCards />,
    x: 0,
    y: 0,
    w: 12,
    h: 2,
  },
  {
    id: 'invoices',
    content: <InvoiceTable />,
    x: 0,
    y: 2,
    w: 8,
    h: 4,
  },
  {
    id: 'customers',
    content: <CustomerList />,
    x: 8,
    y: 2,
    w: 4,
    h: 4,
  },
  {
    id: 'payments',
    content: <PaymentHistory />,
    x: 0,
    y: 6,
    w: 12,
    h: 3,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: layoutData } = useQuery({
    queryKey: ['dashboard-layout'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: DashboardWidget[]) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('dashboard_layouts')
        .upsert({
          created_by: user.id,
          layout: JSON.stringify(newLayout),
          is_active: true,
        });

      if (error) throw error;
    },
  });

  const currentLayout = layoutData?.layout ? JSON.parse(layoutData.layout) as DashboardWidget[] : defaultWidgets;

  const handleLayoutChange = (layout: Layout[]) => {
    const updatedWidgets = currentLayout.map((widget, index) => ({
      ...widget,
      ...layout[index],
    }));
    updateLayoutMutation.mutate(updatedWidgets);
  };

  return (
    <div className="container mx-auto p-4">
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={12}
        rowHeight={100}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
      >
        {currentLayout.map((widget) => (
          <div key={widget.id}>
            <Card className="h-full">
              {widget.content}
            </Card>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}