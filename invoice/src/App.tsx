import React from "react";
import { Card, CardBody, Tabs, Tab } from "@heroui/react";
import { InvoiceGenerator } from "./components/invoice-generator";
import { InvoiceList } from "./components/invoice-list";
import { Icon } from "@iconify/react";
import { Analytics } from "./components/analytics";
import { Settings } from "./components/settings";
import { Customers } from "./components/customers";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { Login } from "./components/auth/Login";
import { AppLayout } from "./components/layout/AppLayout";
import { UserManagement } from "./components/users/UserManagement";

// Protected route component
const ProtectedRoute = ({ children, requiredPermission }: { children: React.ReactNode, requiredPermission?: string }) => {
  const { currentUser, hasPermission } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<div>Dashboard Content</div>} />
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="invoices/create" element={<InvoiceGenerator />} />
              <Route path="customers" element={<Customers />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={
                <ProtectedRoute requiredPermission="manage:users">
                  <UserManagement />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}