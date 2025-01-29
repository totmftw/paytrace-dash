import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import InvoicesAndPayments from "./pages/InvoicesAndPayments";
import Payments from "./pages/Payments";
import UserManagement from "./pages/UserManagement";
import WhatsappReminders from "./pages/WhatsappReminders";
import UserProfiles from "./pages/UserProfiles";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";

import { FinancialYearProvider } from "@/contexts/FinancialYearContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FinancialYearProvider>
        <Router>
          {/* Existing providers and routes */}
        </Router>
      </FinancialYearProvider>
    </QueryClientProvider>
  );
}
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="products" element={<Products />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices-payments" element={<InvoicesAndPayments />} />
                <Route path="payments" element={<Payments />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="user-profiles" element={<UserProfiles />} />
                <Route path="whatsapp-reminders" element={<WhatsappReminders />} />
              </Route>
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;