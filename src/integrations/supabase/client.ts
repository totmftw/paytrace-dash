import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bkhfpjckozgowcfcmbji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraGZwamNrb3pnb3djZmNtYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjU1NDUsImV4cCI6MjA1Mjk0MTU0NX0.yNcAVIKFYNCsm-fuYEGayim8x4qQpnBnJUMIIdR_LGE";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);