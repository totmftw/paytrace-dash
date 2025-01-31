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
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching layout:", error);
        return { layout: [] };
      }

      let parsedLayout: Layout[];
      if (data?.layout) {
        if (typeof data.layout === 'string') {
          parsedLayout = JSON.parse(data.layout);
        } else if (Array.isArray(data.layout)) {
          parsedLayout = data.layout.map(item => ({
            i: String(item.i),
            x: Number(item.x),
            y: Number(item.y),
            w: Number(item.w),
            h: Number(item.h)
          }));
        } else {
          parsedLayout = [];
        }
      } else {
        parsedLayout = [];
      }

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

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[#E8F3E8]">
      <div className="container mx-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}