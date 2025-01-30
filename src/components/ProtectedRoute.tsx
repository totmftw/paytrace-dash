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
    },
    enabled: !!user,
    retry: 1, // Only retry once to avoid infinite loops
    retryDelay: 1000, // Wait 1 second before retrying
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }

    if (!loading && !profileLoading && adminOnly && userProfile?.role !== 'it_admin') {
      navigate("/dashboard");
    }

    if (error) {
      // If there's an error fetching the profile, redirect to login
      navigate("/login");
    }
  }, [user, loading, navigate, adminOnly, userProfile, profileLoading, error]);

  if (loading || (adminOnly && profileLoading)) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}