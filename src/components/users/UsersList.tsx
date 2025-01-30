import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MoreVertical, 
  UserCog, 
  UserX, 
  Shield, 
  Clock,
  Building,
  Phone,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"] & {
  reports_to: { full_name: string } | null;
  email?: string; // Make email optional since it comes from auth.users
};

interface UsersListProps {
  users: UserProfile[];
  onRefresh: () => void;
}

const UsersList = ({ users, onRefresh }: UsersListProps) => {
  const { toast } = useToast();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "business_owner":
        return "bg-purple-100 text-purple-800";
      case "business_manager":
        return "bg-blue-100 text-blue-800";
      case "order_manager":
        return "bg-green-100 text-green-800";
      case "it_admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardHeader className="border-b bg-moss-green/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="bg-leaf-green text-white">
                    {user.full_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-forest-green">{user.full_name}</CardTitle>
                  <Badge className={`${getRoleColor(user.role)} mt-1`}>
                    {user.role.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Set Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(user.id, "inactive")}>
                    <UserX className="mr-2 h-4 w-4" />
                    Set Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-moss-green">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{user.department || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{user.designation || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone_number || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Joined: {formatDate(user.created_at)}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Reports to:</span>
                  <span className="ml-2">{user.reports_to?.full_name || "N/A"}</span>
                </div>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UsersList;