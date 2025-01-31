// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinancialYearProvider } from './contexts/FinancialYearContext';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FinancialYearProvider>
          <div className="min-h-screen bg-pastel-moss">
            <Dashboard />
          </div>
        </FinancialYearProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
