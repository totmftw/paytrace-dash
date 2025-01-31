import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Layout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export default function DashboardLayout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === "it_admin";

  const { data: layoutData } = useQuery<Layout[]>({
    queryKey: ["dashboard-layout", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching layout:", error);
        return [];
      }

      return data?.layout || [];
    },
    enabled: !!user,
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: Layout[]) => {
      if (!user) throw new Error("No user");
      
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          user_id: user.id,
          layout: newLayout,
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

  useEffect(() => {
    if (layoutData && isITAdmin) {
      // Update the layout with the retrieved data
      // (You would need to set the layout in your state here)
    }
  }, [layoutData, isITAdmin]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[#E8F3E8]">
      <div className="container mx-auto p-6">
        {/* Render the child route component */}
        <Outlet />
      </div>
    </div>
  );
}