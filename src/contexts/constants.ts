
import { supabase } from '../integrations/supabase/client';

export const getInitialSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getAuthStateChangeSubscription = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
    // This callback is handled in the AuthProvider
  });
  return subscription;
};
