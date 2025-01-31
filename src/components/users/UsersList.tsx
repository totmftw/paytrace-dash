import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface UsersListProps {
  users: UserProfile[];
}

const UsersList = ({ users }: UsersListProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "business_owner":
        return "bg-purple-500";
      case "business_manager":
        return "bg-blue-500";
      case "order_manager":
        return "bg-green-500";
      case "it_admin":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profile_image_url || ""} />
              <AvatarFallback>{user.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.full_name}</CardTitle>
              <Badge className={`${getRoleColor(user.role)} mt-1`}>
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Department</dt>
                <dd>{user.department || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Designation</dt>
                <dd>{user.designation || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd>{user.phone_number || "N/A"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UsersList;