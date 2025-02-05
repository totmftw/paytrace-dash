// src/components/dashboard/Dashboard.tsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { FinancialYearSelector } from './FinancialYearSelector';

interface DashboardLayout {
  // Add your layout properties here
  id: string;
  position: number;
  // Add other properties as needed
}

export function Dashboard() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout[]>([]);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleLayoutSave = async () => {
    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .upsert({ 
          user_id: user?.id,
          layout: layout 
        });

      if (error) throw error;
      
      setSnackbarState({
        open: true,
        message: 'Layout saved successfully',
        severity: 'success'
      });
      setIsConfiguring(false);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Failed to save layout',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <FinancialYearSelector
          value={selectedYear}
          onChange={setSelectedYear}
        />
        {user?.role === 'admin' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={isConfiguring ? 'contained' : 'outlined'}
              onClick={() => setIsConfiguring(!isConfiguring)}
            >
              {isConfiguring ? 'Cancel' : 'Configure Layout'}
            </Button>
            {isConfiguring && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleLayoutSave}
              >
                Apply Changes
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isConfiguring}
        isResizable={isConfiguring}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
      >
        {/* Grid items will go here */}
      {/* </ResponsiveGridLayout> */}

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbarState.severity}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
