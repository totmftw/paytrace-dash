// src/context/constants.ts
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'

export const getInitialSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const getAuthStateChangeSubscription = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
    // This callback is not used in this file, but it's required by the onAuthStateChange method
  })
  return subscription
}

// src/context/types.ts
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export { AuthContextType };

// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { getInitialSession, getAuthStateChangeSubscription } from './constants'
import { AuthContextType } from './types';
import { useAuthProvider } from './AuthProvider';

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return useAuthProvider({ children });
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// src/context/AuthProvider.tsx
import { useState, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { getInitialSession, getAuthStateChangeSubscription } from './constants'
import { AuthContext } from './AuthContext';
import { AuthContextType } from './types';

export function useAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getInitialSession().then((session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const subscription = getAuthStateChangeSubscription()
    const handleAuthStateChange = (_event: any, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }
    supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      subscription.unsubscribe()
      supabase.auth.offAuthStateChange(handleAuthStateChange)
    }
  }, [])

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        persistSession: rememberMe
      }
    });
    if (error) throw error;

    setUser(data.user);
    setSession(data.session);
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}
