import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ColumnConfigProvider } from '@/contexts/ColumnConfigContext';
import { FinancialYearProvider } from '@/contexts/FinancialYearContext';
import AppRoutes from './AppRoutes';
import './index.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FinancialYearProvider>
            <ColumnConfigProvider>
              <AppRoutes />
            </ColumnConfigProvider>
          </FinancialYearProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}