import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: userProfile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user profile. Please try logging in again.",
            variant: "destructive",
          });
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Network error:', error);
        toast({
          title: "Network Error",
          description: "Failed to connect to the server. Please check your internet connection.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    if (!loading && !profileLoading && adminOnly && userProfile?.role !== 'it_admin') {
      navigate("/dashboard");
    }

    if (error) {
      navigate("/login");
    }
  }, [user, loading, navigate, adminOnly, userProfile, profileLoading, error]);

  if (loading || (adminOnly && profileLoading)) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}