// src/components/dashboard/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FinancialYearSelector } from './FinancialYearSelector';
import { DashboardMetric } from './DashboardMetric';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Dashboard() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [layout, setLayout] = useState([]);
  const [metrics, setMetrics] = useState({
    pending: 0,
    outstanding: 0,
    sales: 0,
    orders: 0
  });

  useEffect(() => {
    loadLayout();
    if (selectedYear) {
      fetchMetrics();
    }
  }, [selectedYear]);

  const loadLayout = async () => {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .single();

    if (data) {
      setLayout(data.layout);
    }
  };

  const saveLayout = async () => {
    const { error } = await supabase
      .from('dashboard_layouts')
      .upsert({ layout });

    if (!error) {
      toast.success('Layout saved successfully');
      setIsConfiguring(false);
    } else {
      toast.error('Failed to save layout');
    }
  };

  const fetchMetrics = async () => {
    // Implementation for fetching metrics based on selected year
    // Will provide this in the next part
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <FinancialYearSelector
          value={selectedYear}
          onChange={setSelectedYear}
        />
        {user?.role === 'IT_ADMIN' && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsConfiguring(!isConfiguring)}
              variant={isConfiguring ? 'destructive' : 'default'}
            >
              {isConfiguring ? 'Cancel' : 'Configure Layout'}
            </Button>
            {isConfiguring && (
              <Button onClick={saveLayout}>
                Apply Changes
              </Button>
            )}
          </div>
        )}
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isConfiguring}
        isResizable={isConfiguring}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
      >
        {/* Metrics components will go here */}
      </ResponsiveGridLayout>
    </div>
  );
}
