// src/layouts/DashboardLayout.tsx
import { useEffect } from "react";
import GridLayout from "react-grid-layout";
import { Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ editable = false }: { editable?: boolean }) {
  const { user } = useAuth();
  const isITAdmin = user?.role === "it_admin";

  const { data: layout, error: layoutError } = useQuery({
    queryKey: ["dashboard-layout", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("*")
        .eq("user_id", user.id);
      if (error || !data?.length) return [];
      return data?.[0]?.layout || [];
    },
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("dashboard_layouts")
        .upsert({ user_id: user.id, layout: newLayout });
      return error ?? null;
    },
  });

  useEffect(() => {
    if (editable && layout) updateLayoutMutation.mutate(layout);
  }, [editable, layout]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto p-6">
        {editable && (
          <div className="mb-4">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={async () => {
                if (isITAdmin) {
                  const success = await updateLayoutMutation.mutateAsync(layout);
                  if (!success) alert("Layout saved successfully!");
                }
              }}
            >
              Save Layout
            </button>
          </div>
        )}
        <GridLayout
          className="layout"
          layout={layout || []}
          cols={12}
          rowHeight={30}
          margin={[10, 10]}
          compactType="vertical"
          isDraggable={editable}
          isResizable={editable}
          onLayoutChange={(newLayout) => {
            updateLayoutMutation.mutate(newLayout);
          }}
        >
          <Outlet />
        </GridLayout>
      </div>
    </div>
  );
}