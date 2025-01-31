// src/components/dashboard/DashboardMetric.tsx
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';

interface DashboardMetricProps {
  title: string;
  value: string | number;
  type: 'pending' | 'outstanding' | 'sales' | 'orders';
  data: any[];
  onMetricClick: () => void;
}

export function DashboardMetric({ title, value, type, data, onMetricClick }: DashboardMetricProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { header: 'Invoice No', accessorKey: 'invNumber' },
    { header: 'Customer', accessorKey: 'customerName' },
    { header: 'Date', accessorKey: 'invDate' },
    { header: 'Due Date', accessorKey: 'invDueDate' },
    { header: 'Amount', accessorKey: 'invTotalAmount' },
  ];

  return (
    <>
      <div 
        className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsDialogOpen(true)}
      >
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold mt-2">
          {type !== 'orders' ? `₹${value.toLocaleString()}` : value}
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content className="max-w-4xl">
          <Dialog.Header>
            <Dialog.Title>{title} Details</Dialog.Title>
          </Dialog.Header>
          <div className="max-h-[70vh] overflow-auto">
            <DataTable
              columns={columns}
              data={data}
              pagination
            />
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
