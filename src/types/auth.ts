
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, options?: { rememberMe?: boolean }) => Promise<{ data: any; error: any; }>;
  signOut: () => Promise<{ error: any; }>;
  resetPassword: (email: string) => Promise<{ error: any; }>;
}
