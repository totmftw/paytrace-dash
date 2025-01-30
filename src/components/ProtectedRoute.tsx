import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    if (!loading && !profileLoading && adminOnly && userProfile?.role !== 'it_admin') {
      navigate("/dashboard");
    }
  }, [user, loading, navigate, adminOnly, userProfile, profileLoading]);

  if (loading || (adminOnly && profileLoading)) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}