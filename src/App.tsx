import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
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
    </Router>
  );
}

export default App;