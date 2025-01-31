// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { FinancialYearProvider } from './contexts/FinancialYearContext';
import { Toaster } from './components/ui/toaster';
import Routes from './Routes';

const queryClient = new QueryClient();

function App() {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <BrowserRouter>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FinancialYearProvider>
              <Routes />
              <Toaster />
            </FinancialYearProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SessionContextProvider>
    </BrowserRouter>
  );
}

export default App;
