import { Button } from '@radix-ui/react-button';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export function LayoutConfig({ layout }: { layout: Layout[] }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveLayoutMutation = useMutation({
    mutationFn: async (layout: Layout[]) => {
      if (!user) throw new Error('User not authenticated');
      await supabase.from('dashboard_layouts').upsert({
        user_id: user.id,
        layout,
      });
    },
    onSuccess: () => {
      toast({ title: 'Layout saved successfully' });
    },
    onError: () => {
      toast({ title: 'Error saving layout', variant: 'error' });
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