import { useEffect } from "react";
import GridLayout from "react-grid-layout";
import { Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardLayoutData {
  id: string;
  created_by: string;
  layout: Layout[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SerializedLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function DashboardLayout({ editable = false }: { editable?: boolean }) {
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

      if (data) {
        const layout = data.layout as unknown as SerializedLayout[];
        return {
          ...data,
          layout: layout.map(item => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          }))
        } as DashboardLayoutData;
      }
      return null;
    },
    enabled: !!user,
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: Layout[]) => {
      if (!user) throw new Error("No user");
      
      const serializedLayout = newLayout.map(item => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      })) as unknown as Json;

      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({
          created_by: user.id,
          layout: serializedLayout,
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

  useEffect(() => {
    if (editable && layoutData?.layout && isITAdmin) {
      updateLayoutMutation.mutate(layoutData.layout);
    }
  }, [editable, layoutData, isITAdmin]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto p-6">
        {editable && isITAdmin && (
          <div className="mb-4">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={() => {
                if (layoutData?.layout) {
                  updateLayoutMutation.mutate(layoutData.layout);
                }
              }}
            >
              Save Layout
            </button>
          </div>
        )}
        <GridLayout
          className="layout"
          layout={layoutData?.layout || []}
          cols={12}
          rowHeight={30}
          width={1200}
          margin={[10, 10]}
          compactType="vertical"
          isDraggable={editable}
          isResizable={editable}
          onLayoutChange={(newLayout) => {
            if (editable && isITAdmin) {
              updateLayoutMutation.mutate(newLayout);
            }
          }}
        >
          <Outlet />
        </GridLayout>
      </div>
    </div>
  );
}