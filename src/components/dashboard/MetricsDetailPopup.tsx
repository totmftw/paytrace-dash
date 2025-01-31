import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from '@/components/ui/datatable';

interface MetricsDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  columns: any[];
  title?: string;
}

export const MetricsDetailPopup: React.FC<MetricsDetailPopupProps> = ({
  isOpen,
  onClose,
  data,
  columns,
  title = "Data Details"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DataTable data={data} columns={columns} />
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};