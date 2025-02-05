import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Products from "@/pages/Products";
import Transactions from "@/pages/Transactions";
import UserManagement from "@/pages/UserProfiles";
import WhatsappReminders from "@/pages/WhatsappReminders";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="products" element={<Products />} />
                      <Route path="transactions" element={<Transactions />} />
                      <Route
                        path="user-management"
                        element={
                          <ProtectedRoute adminOnly>
                            <UserManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="whatsapp-reminders" element={<WhatsappReminders />} />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;