import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ROLES } from "./types";

interface Permission {
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface RolePermissionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolePermissionsManager({ isOpen, onClose }: RolePermissionsManagerProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[number]>("business_manager");

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["role-permissions", selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", selectedRole);

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
        .eq("role", selectedRole)
        .eq("resource", resource);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error) {
      console.error("Error updating permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permission",
      });
    }
  };

  const resources = [
    {
      name: "Dashboard",
      key: "dashboard",
      children: [
        { name: "Analytics", key: "analytics" },
        { name: "Reports", key: "reports" },
      ],
    },
    {
      name: "Customers",
      key: "customers",
      children: [
        { name: "Customer List", key: "customer_list" },
        { name: "Customer Groups", key: "customer_groups" },
      ],
    },
    {
      name: "Products",
      key: "products",
      children: [
        { name: "Product List", key: "product_list" },
        { name: "Categories", key: "categories" },
      ],
    },
    {
      name: "Transactions",
      key: "transactions",
      children: [
        { name: "Invoices", key: "invoices" },
        { name: "Payments", key: "payments" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Role Permissions</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="w-48">
            <select
              className="w-full p-2 border rounded"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as typeof ROLES[number])}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <ScrollArea className="flex-1 h-[60vh]">
            <div className="space-y-6">
              {resources.map((resource) => (
                <div key={resource.key} className="space-y-2">
                  <h3 className="font-semibold">{resource.name}</h3>
                  <div className="ml-4 space-y-2">
                    {resource.children.map((child) => {
                      const permission = permissions?.find(
                        (p) => p.resource === child.key
                      );
                      return (
                        <div key={child.key} className="flex items-center gap-4">
                          <span className="w-32">{child.name}</span>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2">
                              <Checkbox
                                checked={permission?.can_view}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    child.key,
                                    "can_view",
                                    !!checked
                                  )
                                }
                              />
                              View
                            </label>
                            <label className="flex items-center gap-2">
                              <Checkbox
                                checked={permission?.can_create}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    child.key,
                                    "can_create",
                                    !!checked
                                  )
                                }
                              />
                              Create
                            </label>
                            <label className="flex items-center gap-2">
                              <Checkbox
                                checked={permission?.can_edit}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    child.key,
                                    "can_edit",
                                    !!checked
                                  )
                                }
                              />
                              Edit
                            </label>
                            <label className="flex items-center gap-2">
                              <Checkbox
                                checked={permission?.can_delete}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    child.key,
                                    "can_delete",
                                    !!checked
                                  )
                                }
                              />
                              Delete
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}