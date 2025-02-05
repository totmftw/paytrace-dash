// src/components/dashboard/DashboardMetric.tsx
import { useState } from 'react';
import { Dialog } from '@mui/material';  
import { DataGrid } from '@mui/x-data-grid';  

interface DashboardMetricProps {
  title: string;
  value: string | number;
  type: 'pending' | 'outstanding' | 'sales' | 'orders';
  data: { invNumber: string; customerName: string; invDate: string; invDueDate: string; invTotalAmount: number }[];
  onMetricClick: () => void;
}

interface RowData {
  id: number;
  invNumber: string;
  customerName: string;
  invDate: string;
  invDueDate: string;
  invTotalAmount: number;
}

export const DashboardMetric = ({ title, value, type, data, onMetricClick }: DashboardMetricProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    onMetricClick();
    setIsDialogOpen(true);
  };

  const columns = [
    { field: 'invNumber', headerName: 'Invoice No' },
    { field: 'customerName', headerName: 'Customer' },
    { field: 'invDate', headerName: 'Date' },
    { field: 'invDueDate', headerName: 'Due Date' },
    { field: 'invTotalAmount', headerName: 'Amount' },
  ];

  const rows: RowData[] = data.map((item, index) => ({ id: index, ...item }));

  return (
    <>
      <div 
        className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold mt-2">
          {type !== 'orders' ? `₹${value.toLocaleString()}` : value}
        </p>
      </div>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <div className="dialog-content">
          <h2>{title} Details</h2>
          <div className="max-h-[70vh] overflow-auto">
            <DataGrid
              columns={columns}
              rows={rows}
              pagination
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
