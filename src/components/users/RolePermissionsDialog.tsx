import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionsTree } from './PermissionsTree';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ROLES = ['business_owner', 'business_manager', 'order_manager', 'it_admin', 'team_member'] as const;

const DEFAULT_PERMISSIONS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    children: [
      { id: 'dashboard.analytics', name: 'Analytics' },
      { id: 'dashboard.reports', name: 'Reports' },
    ],
  },
  {
    id: 'customers',
    name: 'Customers',
    children: [
      { id: 'customers.view', name: 'View Customers' },
      { id: 'customers.edit', name: 'Edit Customers' },
      { id: 'customers.delete', name: 'Delete Customers' },
    ],
  },
  {
    id: 'invoices',
    name: 'Invoices',
    children: [
      { id: 'invoices.view', name: 'View Invoices' },
      { id: 'invoices.create', name: 'Create Invoices' },
      { id: 'invoices.edit', name: 'Edit Invoices' },
      { id: 'invoices.delete', name: 'Delete Invoices' },
    ],
  },
  {
    id: 'payments',
    name: 'Payments',
    children: [
      { id: 'payments.view', name: 'View Payments' },
      { id: 'payments.process', name: 'Process Payments' },
    ],
  },
];

interface RolePermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolePermissionsDialog({ isOpen, onClose }: RolePermissionsDialogProps) {
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[number]>('team_member');
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, [selectedRole]);

  const loadPermissions = async () => {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role', selectedRole);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading permissions",
        description: error.message,
      });
      return;
    }

    // Map the permissions from the database to our tree structure
    const updatedPermissions = DEFAULT_PERMISSIONS.map(category => ({
      ...category,
      children: category.children?.map(child => ({
        ...child,
        checked: data?.some(p => 
          p.resource === category.id && 
          p[`can_${child.id.split('.')[1]}`]
        ),
      })),
    }));

    setPermissions(updatedPermissions);
  };

  const handlePermissionChange = async (id: string, checked: boolean) => {
    const [category, action] = id.split('.');
    
    try {
      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role: selectedRole,
          resource: category,
          [`can_${action}`]: checked,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });

      // Update local state
      setPermissions(prev => 
        prev.map(cat => ({
          ...cat,
          children: cat.children?.map(child => ({
            ...child,
            checked: child.id === id ? checked : child.checked,
          })),
        }))
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating permission",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Role Permissions</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as typeof ROLES[number])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <PermissionsTree
            permissions={permissions}
            onPermissionChange={handlePermissionChange}
          />

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}