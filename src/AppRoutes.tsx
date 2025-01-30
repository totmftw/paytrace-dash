import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { DashboardLayout } from "@/components/DashboardLayout";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Invoices from "@/pages/Invoices";
import InvoicesAndPayments from "@/pages/InvoicesAndPayments";
import Payments from "@/pages/Payments";
import Products from "@/pages/Products";
import Transactions from "@/pages/Transactions";
import UserManagement from "@/pages/UserManagement";
import UserProfiles from "@/pages/UserProfiles";
import WhatsappReminders from "@/pages/WhatsappReminders";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices-and-payments" element={<InvoicesAndPayments />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/products" element={<Products />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/user-profiles" element={<UserProfiles />} />
          <Route path="/whatsapp-reminders" element={<WhatsappReminders />} />
        </Route>
      </Route>

      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;