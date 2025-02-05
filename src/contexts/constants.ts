// Constants used in the application
import { supabase } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

export const API_URL = 'https://api.example.com';
export const TIMEOUT = 5000;

/**
 * Returns the initial session.
 */
export const getInitialSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
};

/**
 * Returns a subscription to auth state changes.
 */
export const getAuthStateChangeSubscription = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Handle auth state change
    });
    return () => subscription.unsubscribe();
};
