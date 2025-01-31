// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Suspense } from 'react';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { FinancialYearProvider } from './contexts/FinancialYearContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <SessionContextProvider supabaseClient={supabase}>
            <AuthProvider>
              <FinancialYearProvider>
                <AppRoutes />
              </FinancialYearProvider>
            </AuthProvider>
          </SessionContextProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
