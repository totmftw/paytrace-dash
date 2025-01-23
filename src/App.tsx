import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Products from "@/pages/Products";
import Invoices from "@/pages/Invoices";
import Payments from "@/pages/Payments";
import UploadPayments from "@/pages/UploadPayments";
import WhatsappReminders from "@/pages/WhatsappReminders";
import Login from "@/pages/Login";
import UserProfiles from "@/pages/UserProfiles";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/upload-payments" element={<UploadPayments />} />
            <Route path="/whatsapp-reminders" element={<WhatsappReminders />} />
            <Route path="/user-profiles" element={<UserProfiles />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;