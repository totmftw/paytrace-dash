import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface Permission {
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function UserPermissionsTable({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_user_permissions", { user_id: userId });

      if (error) throw error;
      return data;
    },
  });

  const handlePermissionChange = async (
    resource: string,
    permission: keyof Permission,
    checked: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("role_permissions")
        .update({ [permission]: checked })
        .eq("resource", resource);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>View</TableHead>
            <TableHead>Create</TableHead>
            <TableHead>Edit</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((permission) => (
            <TableRow key={permission.resource}>
              <TableCell className="font-medium">
                {permission.resource}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.can_view}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(permission.resource, "can_view", !!checked)
                  }
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.can_create}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(permission.resource, "can_create", !!checked)
                  }
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.can_edit}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(permission.resource, "can_edit", !!checked)
                  }
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.can_delete}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(permission.resource, "can_delete", !!checked)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}