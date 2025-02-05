import { useState } from "react";
import { RolePermissionsDialog } from "@/components/users/RolePermissionsDialog";
import { useAuth } from "@/hooks/use-auth";
import UsersList from "@/components/users/UsersList";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function UserManagement() {
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          reports_to (
            full_name
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>
      <UsersList 
        users={users} 
        onRefresh={refetch}
        onManagePermissions={() => setIsPermissionsDialogOpen(true)} 
      />
      <RolePermissionsDialog
        isOpen={isPermissionsDialogOpen}
        onClose={() => setIsPermissionsDialogOpen(false)}
      />
    </div>
  );
}