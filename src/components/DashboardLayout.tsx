import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === "it_admin";

  const { data: layoutData } = useQuery({
    queryKey: ["dashboard-layout", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching layout:", error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      if (!user) throw new Error("No user");
      
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          created_by: user.id,
          layout: newLayout,
          is_active: true
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save layout"
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Layout saved successfully"
      });
    },
  });

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[#E8F3E8]">
      <div className="container mx-auto p-6">
        {/* Render the child route component */}
        <Outlet />
      </div>
    </div>
  );
}