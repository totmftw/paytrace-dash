// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User } from './types';
import { supabase } from '../lib/supabaseClient';
import { useAuthActions } from './authActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signOut, resetPassword } = useAuthActions(setUser);

  useEffect(() => {
    // Check active sessions and sets the user
    const loadSession = async () => {
      const session = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    };
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const contextValue = { user, signIn, signOut, resetPassword, session, loading, error };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
