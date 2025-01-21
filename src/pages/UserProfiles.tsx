import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddUserDialog from "@/components/users/AddUserDialog";
import UsersList from "@/components/users/UsersList";
import { useToast } from "@/components/ui/use-toast";

const UserProfiles = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

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

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">User Management</CardTitle>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading users...</div>
          ) : (
            <UsersList users={users || []} />
          )}
        </CardContent>
      </Card>

      <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} />
    </div>
  );
};

export default UserProfiles;