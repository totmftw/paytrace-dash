
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import DashboardLayout from "@/components/DashboardLayout";
import { useFinancialYear } from "@/hooks/useFinancialYear";

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
  const { currentYear } = useFinancialYear();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      <Route 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard year={currentYear} />} />
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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
