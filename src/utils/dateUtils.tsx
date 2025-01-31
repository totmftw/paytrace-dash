import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "react-grid-layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LayoutData } from "@/types/dashboard";

export default function DashboardLayout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isITAdmin = user?.role === "it_admin";

  const { data: layoutData } = useQuery<LayoutData>({
    queryKey: ["dashboard-layout", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("created_by", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching layout:", error);
        return { layout: [] };
      }

      const parsedLayout = data?.layout ? 
        (typeof data.layout === 'string' ? 
          JSON.parse(data.layout) as Layout[] : 
          Array.isArray(data.layout) ? 
            data.layout.map(item => ({
              i: String(item.i || ''),
              x: Number(item.x || 0),
              y: Number(item.y || 0),
              w: Number(item.w || 1),
              h: Number(item.h || 1)
            })) : 
            []
        ) : [];

      return { layout: parsedLayout };
    },
    enabled: !!user,
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: Layout[]) => {
      if (!user) throw new Error("No user");
      
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          created_by: user.id,
          layout: JSON.stringify(newLayout),
          is_active: true,
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
        <Outlet />
      </div>
    </div>
  );
}