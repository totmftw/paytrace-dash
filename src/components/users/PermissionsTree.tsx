import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Permission {
  id: string;
  name: string;
  children?: Permission[];
  checked?: boolean;
}

interface PermissionsTreeProps {
  permissions: Permission[];
  onPermissionChange: (id: string, checked: boolean) => void;
}

export function PermissionsTree({ permissions, onPermissionChange }: PermissionsTreeProps) {
  const renderPermission = (permission: Permission, level = 0) => {
    return (
      <div key={permission.id} style={{ marginLeft: `${level * 20}px` }} className="mb-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={permission.id}
            checked={permission.checked}
            onCheckedChange={(checked) => onPermissionChange(permission.id, checked as boolean)}
          />
          <Label htmlFor={permission.id}>{permission.name}</Label>
        </div>
        {permission.children && (
          <div className="mt-2">
            {permission.children.map((child) => renderPermission(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      {permissions.map((permission) => renderPermission(permission))}
    </div>
  );
}