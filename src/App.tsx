import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Transactions from "./pages/Transactions";
import UserManagement from "./pages/UserManagement";
import UserProfiles from "./pages/UserProfiles";
import WhatsappReminders from "./pages/WhatsappReminders";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { FinancialYearProvider } from "./contexts/FinancialYearContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <FinancialYearProvider>
            <SidebarProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route 
                    path="products" 
                    element={
                      <ProtectedRoute adminOnly>
                        <Products />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="invoices" 
                    element={
                      <ProtectedRoute adminOnly>
                        <Invoices />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="payments" 
                    element={
                      <ProtectedRoute adminOnly>
                        <Payments />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="user-profiles" element={<UserProfiles />} />
                  <Route path="whatsapp-reminders" element={<WhatsappReminders />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </SidebarProvider>
          </FinancialYearProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;