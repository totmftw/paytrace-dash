// src/components/dashboard/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FinancialYearSelector } from './FinancialYearSelector';
import { DashboardMetric } from './DashboardMetric';
import { DashboardLayout, Metrics } from '@/types/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Dashboard() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    pending: 0,
    outstanding: 0,
    sales: 0,
    orders: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    loadLayout();
    if (selectedYear) {
      fetchMetrics();
    }
  }, [selectedYear]);

  const loadLayout = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setLayout(data.layout);
      }
    } catch (error) {
      console.error('Error loading layout:', error);
      showSnackbar('Failed to load dashboard layout', 'error');
    }
  };

  // ... rest of the implementation
}
// src/components/dashboard/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FinancialYearSelector } from './FinancialYearSelector';
import { DashboardMetric } from './DashboardMetric';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
// src/components/dashboard/Dashboard.tsx
import { Responsive, WidthProvider } from 'react-grid-layout';
// ⚠️ Need to add CSS imports:
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// ⚠️ Missing AuthContext type
interface AuthContextType {
  user: {
    role: string;
  } | null;
}

// ⚠️ Need to properly type the layout state
const [layout, setLayout] = useState<DashboardLayout[]>([]);

// ⚠️ Missing proper typing for metrics
interface Metrics {
  pending: number;
  outstanding: number;
  sales: number;
  orders: number;
}
// src/components/dashboard/Dashboard.tsx
const loadLayout = async () => {
  try {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .single();

    if (error) throw error;
    if (data) {
      setLayout(data.layout);
    }
  } catch (error) {
    console.error('Error loading layout:', error);
    showSnackbar('Failed to load dashboard layout', 'error');
  }
};

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
// src/components/dashboard/Dashboard.tsx
import { Box, Button } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';  // Replace toast with MUI Snackbar
import GridLayout from 'react-grid-layout';  // Use direct import

export function Dashboard() {
  // ... existing implementation
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const saveLayout = async () => {
    const { error } = await supabase
      .from('dashboard_layouts')
      .upsert({ layout });

    if (!error) {
      showSnackbar('Layout saved successfully', 'success');
      setIsConfiguring(false);
    } else {
      showSnackbar('Failed to save layout', 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* ... rest of the JSX using MUI components */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
