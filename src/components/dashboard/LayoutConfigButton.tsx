import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LayoutConfigButton() {
  const { user } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);

  if (user?.role !== 'it_admin') return null;

  return (
    <div>
      <Button onClick={() => setIsConfigOpen(true)}>Configure Layout</Button>
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Layout Configuration</DialogTitle>
          </DialogHeader>
          {/* Add layout configuration controls here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}