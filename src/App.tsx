// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route element={<ProtectedLayout />}>
            {/* All your app routes go here */}
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/transactions" element={<div>Transactions</div>} />
            <Route path="/invoices" element={<div>Invoices</div>} />
            {/* Add more routes as needed */}
          </Route>
          {/* Catch all route - redirect to dashboard if authenticated, login if not */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
