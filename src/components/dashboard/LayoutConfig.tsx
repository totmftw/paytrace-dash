import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "react-grid-layout";

export function LayoutConfig({ layout }: { layout: Layout[] }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveLayoutMutation = useMutation({
    mutationFn: async (layout: Layout[]) => {
      if (!user) throw new Error('User not authenticated');
      await supabase.from('dashboard_layouts').upsert({
        created_by: user.id,
        layout: JSON.stringify(layout),
        is_active: true,
      });
    },
    onSuccess: () => {
      toast({ title: 'Layout saved successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error saving layout',
        variant: 'destructive'
      });
    },
  });

  const handleSave = () => {
    saveLayoutMutation.mutate(layout);
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button onClick={handleSave}>Save Layout</Button>
    </div>
  );
}