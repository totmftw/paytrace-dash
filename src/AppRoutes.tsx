import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Products from "@/pages/Products";
import WhatsappReminders from "@/pages/WhatsappReminders";
import TransactionsPage from "@/pages/Transactions";
import UserManagement from "@/pages/UserProfiles";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes wrapped in AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Dashboard layout for main content */}
        <Route element={<DashboardLayout />}>
        // Remove /invoices and /payments routes
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/customers" element={<Customers />} />
<Route path="/whatsapp-reminders" element={<WhatsappReminders />} />
<Route path="/transactions" element={<TransactionsPage />} />
<Route 
  path="/user-management" 
  element={
    <ProtectedRoute adminOnly>
      <UserManagement />
    </ProtectedRoute>
  } 
/>
          />
        </Route>
      </Route>

      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;