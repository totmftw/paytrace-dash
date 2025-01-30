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
        throw error;
      }

      return data;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
    staleTime: 300000, // 5 minutes
    cacheTime: 3600000, // 1 hour
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (error) {
      console.error('Profile fetch error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to verify your permissions. Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!loading && !profileLoading && adminOnly && userProfile?.role !== 'it_admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, loading, navigate, adminOnly, userProfile, profileLoading, error, toast]);

  if (loading || (adminOnly && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}