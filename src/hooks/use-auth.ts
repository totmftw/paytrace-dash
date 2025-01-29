import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  name: string | null;
  role: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserData(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserData(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setUserData = async (authUser: User) => {
    // Get user profile data from user_profiles table
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', authUser.id)
      .single();

    setUser({
      id: authUser.id,
      name: profile?.full_name || authUser.email,
      role: profile?.role || null
    });
  };

  return { user };
}