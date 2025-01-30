import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Mail, Phone, MapPin, Users, BadgeCheck, Clock } from "lucide-react";

export default function UserProfiles() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          *,
          user_management(email)
        `)
        .order("full_name");

      if (error) throw error;
      return data.map(user => ({
        ...user,
        email: user.user_management?.email
      }));
    },
  });

  const handleUserCreated = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "it_admin":
        return "bg-red-100 text-red-800";
      case "business_owner":
        return "bg-purple-100 text-purple-800";
      case "business_manager":
        return "bg-blue-100 text-blue-800";
      case "order_manager":
        return "bg-green-100 text-green-800";
      case "team_member":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="space-y-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">TOTM User Profiles</h2>
          <p className="text-sm text-muted-foreground">Top of The Mind Solutions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateUserForm onSuccess={handleUserCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-6">
            {users?.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/40">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profile_image_url} />
                      <AvatarFallback>
                        {user.full_name?.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle>{user.full_name}</CardTitle>
                      <Badge variant="secondary" className={getRoleColor(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 opacity-70" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 opacity-70" />
                        <span>{user.phone_number || "Not provided"}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Building2 className="h-4 w-4 opacity-70" />
                        <span>{user.department} - {user.designation}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 opacity-70" />
                        <span>{user.team}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 opacity-70" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <BadgeCheck className="h-4 w-4 opacity-70" />
                        <span>Employee ID: {user.employee_id}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 opacity-70" />
                        <span>Joined: {formatDate(user.created_at)}</span>
                      </div>
                      {user.bio && (
                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-2">Bio</h4>
                          <p className="text-sm text-muted-foreground">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
