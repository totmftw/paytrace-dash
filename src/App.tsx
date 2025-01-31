// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from './contexts/AuthContext';
import { FinancialYearProvider } from './contexts/FinancialYearContext';
import Routes from './Routes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <AuthProvider>
            <FinancialYearProvider>
              <Routes />
            </FinancialYearProvider>
          </AuthProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
