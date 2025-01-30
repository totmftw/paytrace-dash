import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import UsersList from "@/components/users/UsersList";
import { RolePermissionsDialog } from "@/components/users/RolePermissionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
// UserManagement.tsx
import { RolePermissionsDialog } from "@/components/users/RolePermissionsDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function UserManagement() {
  const { user } = useAuth();
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  return (
    <div className="space-y-6 p-6 bg-moss-green/10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-forest-green">User Management</h2>
        {user?.role === "it_admin" && (
          <Button 
            onClick={() => setIsPermissionsDialogOpen(true)}
          >
            Manage Permissions
          </Button>
        )}
      </div>

      {/* Existing code */}
      
      {user?.role === "it_admin" && (
        <RolePermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
        />
      )}
    </div>
  );
}
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
        .select(`
          *,
          reports_to (
            full_name
          )
        `)
        .order("full_name");

      if (error) throw error;
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
          <h2 className="text-2xl font-bold text-forest-green">Access Denied</h2>
          <p className="mt-2 text-moss-green">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-moss-green/10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-forest-green">User Management</h2>
        <div className="flex gap-4">
          {user.role === "it_admin" && (
            <Button 
              onClick={() => setIsPermissionsDialogOpen(true)}
              className="bg-leaf-green hover:bg-leaf-green/90 text-white"
            >
              Manage Role Permissions
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-leaf-green hover:bg-leaf-green/90 text-white">
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <CreateUserForm onSuccess={handleUserCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-moss-green/20">
          <TabsTrigger value="users" className="text-forest-green">Users</TabsTrigger>
          <TabsTrigger value="roles" className="text-forest-green">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          {isLoading ? (
            <div className="text-center text-forest-green">Loading users...</div>
          ) : (
            <UsersList users={users || []} onRefresh={refetch} />
          )}
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          <div className="grid gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-forest-green mb-4">Role Hierarchy</h3>
              <div className="space-y-2 text-moss-green">
                <p>1. Business Owner - Full system access</p>
                <p>2. Business Manager - Manage business operations</p>
                <p>3. Order Manager - Handle orders and inventory</p>
                <p>4. IT Admin - System configuration and user management</p>
                <p>5. Team Member - Basic system access</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {user.role === "it_admin" && (
        <RolePermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
        />
      )}
    </div>
  );
}