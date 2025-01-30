import { useState } from "react";
import { RolePermissionsDialog } from "@/components/users/RolePermissionsDialog";
import { useAuth } from "@/hooks/use-auth";
import UsersList from "@/components/users/UsersList";

export default function UserManagement() {
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>
      <UsersList onManagePermissions={() => setIsPermissionsDialogOpen(true)} />
      <RolePermissionsDialog
        isOpen={isPermissionsDialogOpen}
        onClose={() => setIsPermissionsDialogOpen(false)}
      />
    </div>
  );
}