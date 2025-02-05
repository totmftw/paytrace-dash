
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ColumnConfigProvider } from '@/contexts/ColumnConfigContext';
import { FinancialYearProvider } from '@/contexts/FinancialYearContext';
import AppRoutes from './AppRoutes';
import { Toaster } from "@/components/ui/toaster";
import './index.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FinancialYearProvider>
          <ColumnConfigProvider>
            <AppRoutes />
            <Toaster />
          </ColumnConfigProvider>
        </FinancialYearProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
