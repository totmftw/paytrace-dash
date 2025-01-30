import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import UsersList from "@/components/users/UsersList";
import { RolePermissionsDialog } from "@/components/users/RolePermissionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("full_name");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching users",
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });

  const handleUserCreated = async () => {
    await refetch();
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "User created successfully",
    });
  };

  if (!user || !["it_admin", "business_owner"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="flex gap-4">
          {user.role === "it_admin" && (
            <Button onClick={() => setIsPermissionsDialogOpen(true)}>
              Manage Role Permissions
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <CreateUserForm
                onSuccess={handleUserCreated}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <UsersList users={users || []} />
      )}

      {user.role === "it_admin" && (
        <RolePermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
        />
      )}
    </div>
  );
}